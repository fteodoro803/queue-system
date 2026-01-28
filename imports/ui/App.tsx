import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Home} from "./pages/Home";
import {Patients} from "./pages/Patients";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/patient" element={<Patients/>}>

      </Route>
      <Route path="/admin" element={<Patients/>}/>
      <Route path="/service" element={<Patients/>}/>

    </Routes>
  </BrowserRouter>
);
