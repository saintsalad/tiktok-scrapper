// https://www.tiktok.com/search/video?q=fyp&t=1660998565578

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
import { Tag, Error } from '../../utils/Types';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Array<Tag | Error>>) {
    if (req.method === 'POST') {

        const DATA: Array<Tag | Error> = [];
        const tag: string = req.body.tag;
        if (!tag) {
            res.status(200).json([{ error: 'please provide usernames' }]);
        }
        const TIKTOK_URL = 'https://www.tiktok.com/search/video?q=';

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

        const page = await browser.newPage();
        const url = `${TIKTOK_URL}${tag}`;
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


        res.status(200).json([...DATA]);
        browser.close();

    }
}


