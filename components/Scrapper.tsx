import type { NextPage } from 'next';
import { createRef, useContext, useRef, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { ClipboardIcon } from '@heroicons/react/20/solid';
import { CodeBracketSquareIcon } from '@heroicons/react/20/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface MyProps {
    enabled: boolean,
    input: Array<string> | string,
    type: string
}


export const Scrapper = (
    {
        enabled, input, type
    }: MyProps) => {

    const dummyText = ['[\n\tStart Scrapping to see the result 😎\n]'];
    const [isLoading, setIsLoading] = useState(false);
    const [rocketPos, setRocketPos] = useState(0);
    const [result, setResult] = useState([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isJSONDownloaded, setIsJSONDownloaded] = useState(false);
    const [isExcelDownloaded, setIsExcelDownloaded] = useState(false);

    // const handleLaunch = () => {
    //     setIsLoading(!isLoading);
    //     setTimeout(() => {
    //         let posX = 0;
    //         const rocket = document.getElementById('btn-scrapper') as HTMLButtonElement;
    //         const r = getComputedStyle(rocket)
    //         const parent = rocket.parentElement as HTMLDivElement;
    //         const p = getComputedStyle(parent)
    //         const pWidth = parseInt(p.width.replace('px', '')) - parseInt(r.width.replace('px', ''));
    //         const pPaddRight = parseInt(p.paddingRight.replace('px', ''));
    //         const finalWidth = pWidth - (pPaddRight * 2);
    //         setInterval(() => {
    //             posX += 5;
    //             if (posX <= finalWidth) {
    //                 rocket.style.left = posX + 'px';
    //             }
    //         }, 250)
    //     }, 4000);
    // }

    const handleStartScrapping = async () => {
        await axios.post('/api/user',
            {
                usernames: input
            }
        ).then(res => {
            setResult(res.data);
        })
    }

    const handleDownloadJSONFile = async () => {
        // create file in browser
        const fileName = "tiktok-scrapps";
        const json = JSON.stringify(result, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const href = URL.createObjectURL(blob);

        // create "a" HTLM element with href to file
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setIsJSONDownloaded(true);
    }

    const handleCopyToClipboard = () => {
        setIsCopied(true);
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }

    const handleDownloadExcel = async () => {
        const worksheet = XLSX.utils.json_to_sheet(result);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        XLSX.writeFile(workbook, "tiktok-scrapps.xlsx");
        setIsExcelDownloaded(true);
    };

    const handleClear = () => {
        setResult([]);
        setIsCopied(false);
        setIsExcelDownloaded(false);
        setIsJSONDownloaded(false);
    }

    return (
        <>
            <div className='flex gap-3'>
                <button
                    id='btn-scrapper'
                    disabled={!enabled || isLoading}
                    onClick={handleStartScrapping}
                    className='shadow-lg relative flex items-center justify-center bg-gradient-to-t from-green-600 to-green-400 py-2 px-4 text-white text-sm font-semibold rounded-md enabled:hover:opacity-90 disabled:opacity-80 disabled:shadow-none'>
                    <ArrowRightIcon className='rocket w-5 h-5 text-white hidden' />
                    Start Scrapping
                </button>

                <button
                    disabled={!result.length}
                    onClick={handleClear}
                    className='shadow-lg bg-gradient-to-t from-slate-300 to-white py-2 px-5 text-black text-sm font-semibold rounded-md enabled:hover:opacity-90 disabled:opacity-80 disabled:text-gray-500 disabled:shadow-none'>
                    Clear
                </button>
            </div>

            <div className='h-[1px] w-full bg-white my-5 bg-opacity-50'></div>

            <div className={`bg-black text-white bg-opacity-60 rounded-md ${!enabled ? 'bg-gray-500 bg-opacity-40 text-gray-200' : ''}`}>

                <div className='flex justify-between items-center border-b-[1px] border-opacity-50 border-white'>

                    <div className='px-4 py-5 flex gap-2 '>
                        <div className='h-2 w-2 bg-white rounded-full'></div>
                        <div className='h-2 w-2 bg-white rounded-full'></div>
                        <div className='h-2 w-2 bg-white rounded-full'></div>
                    </div>

                    <div className={`${!result.length && 'pointer-events-none opacity-50'} px-4 flex gap-4 items-center`}>
                        <button onClick={handleCopyToClipboard} title='Copy to Clipboard' className={`${isCopied ? 'text-green-400' : ''} text-white cursor-pointer hover:bg-gray-200 hover:bg-opacity-20 transition-all duration-500 p-1 rounded-sm`}>
                            <ClipboardIcon className='w-5 h-5' />
                        </button>
                        <button onClick={handleDownloadJSONFile} title='Download JSON file' className={`${isJSONDownloaded ? 'text-green-400' : ''} text-white cursor-pointer hover:bg-gray-200 hover:bg-opacity-20 transition-all duration-500 p-1 rounded-sm`}>
                            <CodeBracketSquareIcon className='w-5 h-5' />
                        </button>

                        <button onClick={handleDownloadExcel} title='Download Excel file' className={`${isExcelDownloaded ? 'text-green-400' : ''} text-white cursor-pointer hover:bg-gray-200 hover:bg-opacity-20 transition-all duration-500 p-1 rounded-sm`}>
                            <ArrowDownTrayIcon className='w-5 h-5' />
                        </button>
                    </div>

                </div>

                <pre
                    className='overflow-y-scroll overflow-x-hidden py-3 px-4 text-xs sm:text-sm font-mono whitespace-pre-wrap max-h-[400px]'>
                    {
                        result.length ?
                            JSON.stringify(result, null, 2) :
                            dummyText
                    }
                </pre>
            </div>
        </>
    )
}