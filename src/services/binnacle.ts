import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export interface BinnacleData {
  action: string
  userId?: string
  details?: string
}

export const actions = {
  SIGN_IN: 'Sign In',
  CREATE_CATEGORY: 'Create Category',
  CREATE_RECORD: 'Create Record ',
  DELETE_CATEGORY: 'Delete Category',
  DELETE_RECORD: 'Delete Record',
  UPDATE_CATEGORY: 'Update Category',
  UPDATE_RECORD: 'Update Record'
}

/**
 * Saves a binnacle entry by sending it to the `/api/binnacle` endpoint.
 * This function can be imported and used throughout the client-side of your application.
 * It uses `fetch` and does not require `axios`.
 *
 * @param data The binnacle data to save.
 * @returns The response from the API.
 * @throws An error if the request fails.
 */
export async function saveBinnacleEntry(binnacleData: BinnacleData) {
  const session = await getServerSession(authOptions)

  if (session) {
    binnacleData.userId = session?.user.id
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/binnacle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({ ...binnacleData })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    throw new Error(errorBody?.message || `Request failed with status ${response.status}`)
  }

  return response.json()
}
