import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import axios from '@/utils/axios'

const ContactData = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('/api/v1/contact')
        setContacts(res.data.data)
      } catch (err) {
        console.error('Failed to fetch contacts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (loading) return <div className="text-white text-center py-10">Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Contact Form Submissions</h2>
      <div className="overflow-x-auto rounded-lg border border-white/20">
        <Table>
          <TableHeader className="bg-white/10">
            <TableRow>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Phone</TableHead>
              <TableHead className="text-white">Course</TableHead>
              <TableHead className="text-white">Message</TableHead>
              <TableHead className="text-white">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c._id} className="hover:bg-white/10">
                <TableCell className="text-white">{c.name}</TableCell>
                <TableCell className="text-white">{c.email}</TableCell>
                <TableCell className="text-white">{c.phone}</TableCell>
                <TableCell className="text-white">{c.course}</TableCell>
                <TableCell className="text-white">{c.message}</TableCell>
                <TableCell className="text-white">{new Date(c.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ContactData
