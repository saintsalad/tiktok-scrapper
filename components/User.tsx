import type { NextPage } from 'next';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Scrapper } from '../components/Scrapper'

const User: NextPage = () => {

    const [userInput, setUserInput] = useState('');
    const [usernames, setUsernames] = useState(Array<string>);

    const handleAddUsername = () => {
        const userStr = userInput.trim();
        if (userStr) {
            const isExisting = usernames.find(u => u === userStr) ? true : false;
            if (!isExisting) {
                if (usernames.length <= 5) {
                    const u = [...usernames, userStr];
                    setUserInput('')
                    setUsernames(u);
                } else {
                    alert('maximum entry has been reached')
                }
            } else {
                alert('user already added');
            }

        }
    }

    const handleRemoveUsername = (user: string) => {
        setUsernames(prev => prev.filter(u => u !== user));
    }

    const handleOnEnter = (event: any) => {
        if (event.key === 'Enter') {
            handleAddUsername();
        }
    }

    return (
        <>
            <div className='bg-white bg-opacity-20 backdrop-blur-md border-white border border-opacity-20 rounded-md mt-4 p-5 '>
                <div className='flex flex-col sm:flex-row sm:items-end sm:gap-2 gap-y-2 sm:gap-y-0'>
                    <div>
                        <div className='text-sm text-white font-medium mb-1'>Username</div>
                        <input type="text" value={userInput}
                            className='text-sm py-1.5 px-3 rounded-md w-full sm:min-w-[340px] shadow-sm'
                            onKeyDown={(e) => handleOnEnter(e)}
                            onChange={(e) => setUserInput(e.currentTarget.value)} />
                    </div>
                    <div>
                        <button
                            onClick={handleAddUsername}
                            className='py-1.5 px-5 w-full sm:w-auto text-sm bg-gradient-to-t from-green-600 to-green-400 rounded-md shadow-lg font-semibold hover:opacity-90 text-white'>
                            Add
                        </button>
                    </div>
                </div>

                <div className='h-[1px] w-full bg-white my-5 bg-opacity-50'></div>

                <div className='flex gap-2 flex-wrap'>
                    {usernames.length ? usernames.map((user, i) => (
                        <div key={i}
                            className='transition-all duration-500 font-semibold bg-white rounded-full px-3 py-1 flex items-center gap-3 shadow-sm'>
                            <span className='text-sm sm:text-base'>@{user}</span>
                            <button onClick={() => handleRemoveUsername(user)}>
                                <XMarkIcon className="h-5 w-5 text-green-500 rounded-full hover:bg-black hover:bg-opacity-5 cursor-pointer" />
                            </button>
                        </div>
                    )) : (
                        <div className='px-5 text-sm text-white italic'>No usernames added</div>
                    )}
                </div>
            </div>

            <div className='flex justify-center py-4'>
                <div className={`${usernames.length <= 0 && 'border-black border-opacity-10'} h-8 sm:h-14 border-l-2 border-dashed border-white border-opacity-20 transition-all duration-700`}></div>
            </div>

            <div className={`${usernames.length <= 0 && 'bg-black bg-opacity-10 pointer-events-none'} bg-white bg-opacity-20 backdrop-blur-md border-white border border-opacity-20 rounded-md p-5 transition-all duration-700`}>

                <Scrapper
                    enabled={usernames.length ? true : false}
                    input={usernames}
                    type='user'
                ></Scrapper>
            </div>
        </>

    )
}

export default User