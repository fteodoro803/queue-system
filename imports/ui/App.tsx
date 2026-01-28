import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Home} from "./pages/Home";
import {Patients} from "./pages/Patients";
import {Sidebar} from "/imports/ui/navigation/Sidebar";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<Home />} />
        <Route path="/patient" element={<Patients/>}/>
          <Route path="/admin" element={<Patients/>}/>
        <Route path="/service" element={<Patients/>}/>
      </Route>

    </Routes>
  </BrowserRouter>
);
