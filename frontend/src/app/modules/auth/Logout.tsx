import {useEffect} from 'react'
import {useAuth} from './core/Auth'

export function Logout() {
  const {logout} = useAuth()

  useEffect(() => {
    logout()
    window.location.href = import.meta.env.BASE_URL
  }, [logout])

  return null
}
