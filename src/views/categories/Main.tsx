'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Category } from '@prisma/client'

const paginationModel = { page: 0, pageSize: 5 }

const Main = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category')
        const data = await res.json()

        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories', error)
      }
    }

    fetchCategories()
  }, [])

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    if (editingCategory) {
      // Update logic
      try {
        const res = await fetch(`/api/category/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, description })
        })

        if (res.ok) {
          const updatedCategory = await res.json()

          setCategories(prev => prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)))
          handleCancelEdit()
        } else {
          console.error('Failed to update category')
        }
      } catch (error) {
        console.error('Failed to update category', error)
      }
    } else {
      // Create logic
      try {
        const res = await fetch('/api/category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, description })
        })

        if (res.ok) {
          const newCategory = await res.json()

          setCategories(prev => [...prev, newCategory])
          setName('')
          setDescription('')
          setErrors({})
        } else {
          console.error('Failed to create category')
        }
      } catch (error) {
        console.error('Failed to create category', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const res = await fetch(`/api/category/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setCategories(prev => prev.filter(category => category.id !== id))
      } else {
        console.error('Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description ?? '')
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setErrors({})
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: params => (
        <>
          <IconButton onClick={() => handleEdit(params.row)} size='small'>
            <i className='ri-pencil-line' />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size='small'>
            <i className='ri-delete-bin-line' />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title={editingCategory ? 'Edit Category' : 'Create Category'} />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='Name'
                    placeholder='...'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Description'
                    placeholder='Set Description'
                    sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='ri-message-2-line' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button variant='contained' type='submit' sx={{ mr: 2 }}>
                    {editingCategory ? 'Update' : 'Save'}
                  </Button>
                  {editingCategory && (
                    <Button variant='outlined' color='secondary' onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={categories}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
              />
            </Paper>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Main
