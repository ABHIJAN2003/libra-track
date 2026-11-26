import { BookMark } from './Navbar';

// Left panel shared by the sign-in and register pages
export default function AuthArt() {
  return (
    <section className="lt-login-art">
      <div className="lt-brand">
        <BookMark size={28} />
        LibraTrack
      </div>

      <div>
        <h1>Know who has which book, and when it is due.</h1>
        <p>Record every loan at the desk, find a borrower by name or mobile number, and mark books back as returned.</p>
      </div>

      <div className="lt-lendcard" aria-hidden="true">
        <div className="title">
          Clean Code
          <small>Robert C. Martin</small>
        </div>
        <div className="line"><span>Rahul Sen</span><span className="when">5 Dec</span></div>
        <div className="line void"><span>Meera Nair</span><span className="when">Returned</span></div>
        <div className="line"><span>Arjun Das</span><span className="when">19 Dec</span></div>
        <div className="line"></div>
      </div>
    </section>
  );
}