import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Editor from './pages/Editor';
import EmailWriter from './pages/EmailWriter';
import EssayWriter from './pages/EssayWriter';
import Translator from './pages/Translator';
import Templates from './pages/Templates';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="editor" element={<Editor />} />
          <Route path="editor/:id" element={<Editor />} />
          <Route path="email" element={<EmailWriter />} />
          <Route path="essay" element={<EssayWriter />} />
          <Route path="translate" element={<Translator />} />
          <Route path="templates" element={<Templates />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;