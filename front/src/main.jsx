import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App/App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import { AppLayout } from './components/AppLayout.jsx';
import { Table } from './components/Table/Table.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        index: true,
        element: <App />,
      },
      {
        path: "/diagrams-table",
        element: <Table />,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
