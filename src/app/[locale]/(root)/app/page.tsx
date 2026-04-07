import React from 'react'

const Page = () => {
    return (
        <div>
            <h1 className='text-2xl font-bold'>App</h1>
            <p className='text-md'>Welcome to the app</p>
            <p className="mt-10">Esto no se deberia ver si uno no esta logueado</p>

        </div>
    )
}

export default Page
