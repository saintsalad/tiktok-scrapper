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
import { User, Error } from '../../utils/Types';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Array<User | Error>>) {
    if (req.method === 'POST') {

        const DATA: Array<User | Error> = [];
        const usernames: Array<string> = req.body.usernames || [];
        if (usernames.length === 0) {
            res.status(200).json([{ error: 'please provide usernames' }]);
        }
        const TIKTOK_URL = 'https://www.tiktok.com/';

        const browser = await puppeteer.launch({
            headless: true,
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



        for (let index = 0; index < usernames.length; index++) {
            const page = await browser.newPage();
            const username = usernames[index];
            if (!username) {
                DATA.push({ error: 'blank username' });
                continue;
            }
            const url = `${TIKTOK_URL}@${username}`;
            const raw: User = {
                username: '',
                url: '',
                verified: false,
                name: '',
                profilepicture: '',
                following: '',
                followers: '',
                likes: '',
                description: ''
            };

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
                await page.waitForSelector('div[data-e2e="user-page"]');

                raw.username = username;
                raw.url = url;

                const isNotFound = await page.$x('//*[@id="app"]/div[2]/div[2]/div/main/div/p[1]');
                if (isNotFound.length === 0) {
                    raw.profilepicture = await page.$eval('img[class*="ImgAvatar"]', el => el.getAttribute('src'));
                    raw.name = await page.$eval('h1[data-e2e="user-subtitle"]', el => el.textContent);
                    raw.description = await page.$eval('h2[data-e2e="user-bio"]', el => el.textContent);
                    raw.following = await page.$eval('strong[data-e2e="following-count"]', el => el.textContent);
                    raw.followers = await page.$eval('strong[data-e2e="followers-count"]', el => el.textContent);
                    raw.likes = await page.$eval('strong[data-e2e="likes-count"]', el => el.textContent);
                    try {
                        await page.waitForSelector('h2[data-e2e="user-title"] svg', { timeout: 200 });
                        raw.verified = true;
                    } catch {
                        raw.verified = false;
                    }


                    DATA.push(raw);
                } else {
                    DATA.push({ error: `${username} : username is incorrect or not existing` });
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


