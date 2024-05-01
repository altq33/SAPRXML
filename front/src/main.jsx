import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App/App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import { AppLayout } from './components/AppLayout.jsx';
import { TablePage } from './components/TablePage/TablePage.jsx';
import { FilePage } from './components/FilePage/FilePage.jsx';

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
        element: <TablePage />,
      },
      {
        path: "/file/:id",
        element: <FilePage />,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
