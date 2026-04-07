
import { LoginContent } from '@/components/dialogs/auth/login-content'
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async () => {
    const { userId } = await auth()

    if (userId) {
        return redirect('/');
    }

    return (
        <div className='min-h-screen w-md flex justify-center items-center m-auto'>
            <LoginContent isEmbedded={true} />
        </div>
    )
}

export default Page
