import React from 'react'

const Page = () => {
    return (
        <div>
            <h1 className='text-2xl font-bold'>TESTING</h1>
            <p className='text-md'>Hola Tester</p>
            <p className="mt-10">Esto no se deberia ver si uno no esta logueado como tester</p>
        </div>
    )
}

export default Page
