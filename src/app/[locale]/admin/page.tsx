import React from 'react'

const Page = () => {
    return (
        <div>
            <h1 className='text-2xl font-bold'>ADMIN</h1>
            <p className='text-md'>Hola Admin</p>
            <p className="mt-10">Esto no se deberia ver si uno no esta logueado como admin</p>

        </div>
    )
}

export default Page
