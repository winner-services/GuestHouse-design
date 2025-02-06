import { useRoutes } from 'react-router-dom'
import authRoutes from './routes/AuthRoutes'
import mainRoutes from './routes/MainRoutes'
import { MainProvider } from './config/MainContext'
import DefaultStructure from './config/DefaultStructure'
import 'react-phone-input-2/lib/style.css'
import 'sweetalert2/dist/sweetalert2.css'
import toastr from 'toastr'
import 'toastr/build/toastr.css'

import swal from 'sweetalert2'

window.Swal = swal;
const token = localStorage.getItem('token');
window.BaseUrl = import.meta.env.VITE_API_URL;

let headers = {
	"Content-Type": "application/json",
	"Authorization": `Bearer ${token}`
}

window.BaseUrl = import.meta.env.VITE_API_URL;
window.ImageUrl = import.meta.env.VITE_IMAGE_URL;
window.toastr = toastr
window.headerRequest = headers

function App() {
  
  const routes = [
    ...authRoutes,
    {
      path:'/main',
      element:<DefaultStructure/>,
      children: mainRoutes
    }
  ]

  let globalRoute = useRoutes(routes)

  return (
    <>
      <MainProvider>
        {globalRoute}
      </MainProvider>
    </>
  )
}

export default App
