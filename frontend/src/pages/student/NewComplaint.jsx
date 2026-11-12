import { ArrowLeft, ImagePlus, LoaderCircle, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../services/api'

const categories = [
  'Electricity',
  'Plumbing',
  'Water Supply',
  'Wi-Fi / Internet',
  'Cleaning and Hygiene',
  'Furniture',
  'Washroom',
  'Security',
  'Food Quality',
  'Other',
]
const priorities = ['Low', 'Medium', 'High', 'Urgent']
const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 5 * 1024 * 1024

export default function NewComplaint() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    hostel: user?.hostel || '',
    block: user?.block || '',
    roomNumber: user?.roomNumber || '',
    image: null,
  })
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!form.image) {
      setPreviewUrl('')
      return undefined
    }

    const url = URL.createObjectURL(form.image)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [form.image])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const selectImage = (event) => {
    const file = event.target.files?.[0] || null
    setError('')

    if (file && !imageTypes.includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file && file.size > maxImageSize) {
      setError('Image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setForm((current) => ({ ...current, image: file }))
  }

  const submitComplaint = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'image' && value) payload.append(key, value)
    })
    if (form.image) payload.append('image', form.image)

    try {
      const response = await api.post('/complaints', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/student/complaints/${response.data.complaint._id}`, {
        replace: true,
        state: { notice: 'Your complaint was submitted successfully.' },
      })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-800">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Student services</p>
        <h1 className="mt-1 text-3xl font-bold text-navy-800">Submit a complaint</h1>
        <p className="mt-2 text-slate-500">Tell us what needs attention. Your complaint will be tracked from submission to resolution.</p>
      </div>

      <form className="card space-y-6 p-5 sm:p-8" onSubmit={submitComplaint}>
        <div>
          <label className="label" htmlFor="title">Complaint title</label>
          <input
            id="title"
            className="input"
            name="title"
            value={form.title}
            onChange={updateField}
            minLength={5}
            maxLength={120}
            placeholder="e.g. Water leakage in bathroom"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">Describe the issue</label>
          <textarea
            id="description"
            className="input min-h-32 resize-y"
            name="description"
            value={form.description}
            onChange={updateField}
            minLength={10}
            maxLength={3000}
            placeholder="Include when it started and any details that may help us resolve it."
            required
          />
          <p className="mt-1 text-right text-xs text-slate-400">{form.description.length}/3000</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" name="category" value={form.category} onChange={updateField} required>
              <option value="">Select a category</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" className="input" name="priority" value={form.priority} onChange={updateField} required>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-navy-800">Where should we go?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="hostel">Hostel</label>
              <input id="hostel" className="input" name="hostel" value={form.hostel} onChange={updateField} maxLength={100} required />
            </div>
            <div>
              <label className="label" htmlFor="block">Block</label>
              <input id="block" className="input" name="block" value={form.block} onChange={updateField} maxLength={50} required />
            </div>
            <div>
              <label className="label" htmlFor="roomNumber">Room number</label>
              <input id="roomNumber" className="input" name="roomNumber" value={form.roomNumber} onChange={updateField} maxLength={30} required />
            </div>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="image">Photo (optional)</label>
          <label
            htmlFor="image"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-teal-500 hover:bg-teal-50/40"
          >
            <ImagePlus className="mb-2 text-teal-700" size={24} />
            <span className="text-sm font-semibold text-slate-700">Choose an image to attach</span>
            <span className="mt-1 text-xs text-slate-500">JPEG, PNG, or WebP · up to 5 MB</span>
            <input id="image" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} />
          </label>
          {previewUrl && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-2">
              <img src={previewUrl} alt="Selected complaint" className="h-16 w-16 rounded-lg object-cover" />
              <p className="min-w-0 flex-1 truncate text-sm text-slate-600">{form.image.name}</p>
              <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Remove image" onClick={() => setForm((current) => ({ ...current, image: null }))}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <Link to="/student/complaints" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-accent" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={16} />}
            {loading ? 'Submitting...' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}
