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
import { LinksPage } from './components/LinksPage/LinksPage.jsx';
import { TermsPage } from './components/TermsPage/Terms.jsx';
import { OntologyPage } from './components/OntologyPage/OntologyPage.jsx';

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
        path: "/links/:id/",
        element: <LinksPage />,
      },

      {
        path: "/links/:id/terms/:termId",
        element: <LinksPage />,
      },
      {
        path: "/dictionary/:id",
        element: <TermsPage />,
      },
      {
        path: "/link-types",
        element: <OntologyPage />,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
