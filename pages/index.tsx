import type { NextPage } from 'next';
import axios from 'axios';
import { useState } from 'react';
import User from '../components/User';

const Home: NextPage = () => {


  const [activeTab, setActiveTab] = useState(0);

  const callApi = async () => {
    // fetch('/api/user', { headers: 
    //   { 
    //     'x-access-token': accessToken,
    //     usernames: ['nianaguerrero']
    // } })
    //   .then((response) => console.log(response.json()));

    await axios.post('/api/user',
      {
        usernames: ['nianaguerrero', 'jirogame']
      }
    ).then(res => {
      console.log(res.data);
    })


  }

  return (
    <div id='app'
      className='h-screen py-10'>
      <div
        className='flex flex-col mx-auto rounded-full w-full max-w-4xl'>
        <div className='flex bg-white bg-opacity-20 backdrop-blur-md border-white border border-opacity-20 rounded-md'>
          <button onClick={() => setActiveTab(0)}
            className={`${activeTab === 0 ? 'bg-gradient-to-bl from-white to-slate-200 shadow-lg' : ''} transition-all rounded-md py-1 px-7 font-semibold`}>User</button>
          <button onClick={() => setActiveTab(1)}
            className={`${activeTab === 1 ? 'bg-gradient-to-bl from-white to-slate-200 shadow-lg' : ''} transition-all rounded-md py-1 px-7 font-semibold`}>Video</button>
          <button onClick={() => setActiveTab(2)}
            className={`${activeTab === 2 ? 'bg-gradient-to-bl from-white to-slate-200 shadow-lg' : ''} transition-all rounded-md py-1 px-7 font-semibold`}>Tag</button>
        </div>
        {/* <button onClick={callApi}>Call API</button> */}

        {activeTab === 0 && (
          <User></User>

        )}
        {activeTab === 1 && (
          <div className='bg-white bg-opacity-20 backdrop-blur-md border-white border border-opacity-20 rounded-md mt-4 p-3 min-h-[400px]'> video </div>
        )}
        {activeTab === 2 && (
          <div className='bg-white bg-opacity-20 backdrop-blur-md border-white border border-opacity-20 rounded-md mt-4 p-3 min-h-[400px]'> tag </div>
        )}
      </div>
    </div>
  )
}

export default Home
