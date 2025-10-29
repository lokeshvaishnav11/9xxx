import React, { useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import { Toast } from 'react-toastify/dist/components'
import { toast } from 'react-toastify'
import betService from '../../../services/bet.service'

const Notices = () => {
  const [userNotice, setUserNotice] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log(userNotice,adminNotice)

    const data = {
        userNotice,
        adminNotice,
      }
  

      try {
        const res: AxiosResponse<any> = await betService.notice(data)
  
        console.log(res, 'res for lena dena jai hind !')
  
        if (res.data?.error === false) {
          toast.success(res.data.message || 'Notice submitted successfully!')
          setUserNotice('')
          setAdminNotice('')
        } else {
          toast.error(res.data.message || 'Failed to send notices.')
        }
      } catch (error) {
        console.error('Error sending notices:', error)
        toast.error('Failed to send notices.')
      } finally {
        setLoading(false)
      }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
    <h2 className="text-xl font-bold mb-4">Send Notices</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-1 font-medium">User Notice</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={userNotice}
          onChange={(e) => setUserNotice(e.target.value)}
          placeholder="Enter user notice"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Admin Notice</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={adminNotice}
          onChange={(e) => setAdminNotice(e.target.value)}
          placeholder="Enter admin notice"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Submit Notices'}
      </button>
    </form>
  </div>
  )
}

export default Notices
