import puppeteer from 'puppeteer-extra';
const CaptchaSolver = require('tiktok-captcha-solver');

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

import type { NextApiRequest, NextApiResponse } from 'next'
import { Video, Error } from '../../utils/Types';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Array<Video | Error>>) {
    if (req.method === 'POST') {

        const DATA: Array<Video | Error> = [];
        const urls: Array<string> = req.body.urls || [];
        if (urls.length === 0) {
            res.status(200).json([{ error: 'please provide urls' }]);
        }

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
            ]
        });

        for (let index = 0; index < urls.length; index++) {
            const page = await browser.newPage();
            const url = urls[index];

            if (!url) {
                DATA.push({ error: 'blank url' });
                continue;
            }

            const raw: Video = {
                username: '',
                url: '',
                id: '',
                thumbnail: '',
                likes: '',
                description: '',
                comments: '',
                shares: '',
                date: ''
            }

            raw.url = url;
            raw.username = url.split('/')[3];
            raw.id = url.split('/')[5].split('?')[0];

            try {
                const captchaSolver = new CaptchaSolver(page);
                await page.goto(url, { waitUntil: ['networkidle2'] });
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (req.resourceType() === 'stylesheet' ||
                        req.resourceType() === 'font' ||
                        req.resourceType() === 'media' ||
                        req.resourceType() === 'image' ||
                        url.endsWith('.mp4') ||
                        url.endsWith('.avi') ||
                        url.endsWith('.flv') ||
                        url.endsWith('.mov') ||
                        url.endsWith('.wmv')) req.abort()
                    else req.continue()
                });
                await captchaSolver.solve();

                const isNotFound = await page.$x('//*[@id="app"]/div[2]/div[2]/div[1]/div/p[1]');
                if (isNotFound.length === 0) {

                    raw.thumbnail = await page.$eval('img[class*="ImgPoster"]', el => el.getAttribute('src'));
                    raw.likes = await page.$eval('strong[data-e2e="like-count"]', el => el.textContent);
                    raw.comments = await page.$eval('strong[data-e2e="comment-count"]', el => el.textContent);
                    raw.shares = await page.$eval('strong[data-e2e="share-count"]', el => el.textContent);
                    raw.date = await page.$eval('span[data-e2e="browser-nickname"] span:last-child', el => el.textContent);
                    raw.description = await page.$eval('div[data-e2e="browse-video-desc"]', el => el.textContent);


                    DATA.push(raw);
                } else {
                    DATA.push({ error: `${url} : invalid url, please check again` });
                }


            } catch (err) {
                console.log(err);
                DATA.push({ error: err });
            }

            page.close();
        }

        res.status(200).json([...DATA]);
        browser.close();

    }
}