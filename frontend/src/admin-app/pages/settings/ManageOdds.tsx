import React, { useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import { Toast } from 'react-toastify/dist/components'
import { toast } from 'react-toastify'
import betService from '../../../services/bet.service'

const Notices = () => {
  const [uback, setUback] = useState('')
  const [ulay, setUlay] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log(uback,ulay)

    const data = {
        uback,
        ulay,
      }
  

      try {
        const res: AxiosResponse<any> = await betService.manageodd(data)
  
        console.log(res, 'res for lena dena jai hind !')
  
        if (res.data?.error === false) {
          toast.success(res.data.message || 'Odds Update successfully!')
          // setUback('')
          // setUlay('')
        } else {
          toast.error(res.data.message || 'Failed to send odds.')
        }
      } catch (error) {
        console.error('Error sending odds:', error)
        toast.error('Failed to send odds.')
      } finally {
        setLoading(false)
      }
  }




  const [prevodd, setPrevodd] = React.useState<any>();
    React.useEffect(() => {
     betService.prevodds().then((res: AxiosResponse<any>) => {
      console.log(res,"ddfdfdfdffdffdfdfd")
      const odds = res.data?.data?.[0]; // Safely access first element

      if (odds) {
        setUback(odds.Backs?.toString() || '');
        setUlay(odds.Lays?.toString() || '');
      }
        });
    }, []);



  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
    <h2 className="text-xl font-bold mb-4">Odds Manage</h2>
    <form onSubmit={handleSubmit} >
      <div className="mb-4">
        <label className="block mb-1 font-medium">Back</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={uback}
          onChange={(e) => setUback(e.target.value)}
          placeholder="Enter Back "
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Lay</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={ulay}
          onChange={(e) => setUlay(e.target.value)}
          placeholder="Enter Lay "
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Submit Odds'}
      </button>
    </form>
  </div>
  )
}

export default Notices
