import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"
import { MainContext } from "../../config/MainContext";
import axios from 'axios';

function LoginPage() {
    const { setToken } = useContext(MainContext);
    const [loader, setLoader] = useState(false)
    const navigate = useNavigate();
    const [form, setForm] = useState({
        phone: "",
        password: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.phone) {
            toastr.error("Veillez entrer votre email.", "Erreur!")
            return
        }

        if (!form.password) {
            toastr.error("Veillez entrer votre mot de passe.", "Erreur!")
            return
        }

        setLoader(true)
        try {
            const response = await axios.post(`${BaseUrl}/auth/login`, form);
            const token = response.data.access_token;
            if (token) {
                console.log("response:", token)
                setToken(response.data.access_token, response.data.user, response.data.permissions, response.data.role);
                // navigate('/main');
                location.href = "/main"
            } else {
                console.log(response.data.message)
                toastr.error(response.data.message, "Erreur!")
            }

            setLoader(false)
        } catch (error) {
            console.error(error); // Handle login errors gracefully
            toastr.error("Erreur du serveur", "Erreur!")
            setLoader(false)
        }
    };

    return <>
        <div id="global-loader" style={{ display: loader ? '' : 'none', zIndex: 9 }}>
            <div className="whirly-loader"> </div>
        </div>
        <div className="side-overlay"></div>
        <section className="auth d-flex">
            <div className="auth-left bg-main-50 flex-center p-24">
                <img src="assets/images/thumbs/auth-img1.png" alt="" />
            </div>
            <div className="auth-right py-40 px-24 flex-center flex-column">
                <div className="auth-right__inner mx-auto w-100">
                    <a href="#" className="auth-right__logo" style={{textAlign:'center'}}>
                        <img src="favicon-icon.jpeg" alt="" style={{ height: 100 }} />
                        <h3 className="text-success">JOHN SERVICE MOTEL</h3>
                    </a>
                    
                    <h2 className="mb-8">Bienvenu!</h2>
                    <p className="text-gray-600 text-15 mb-32">Connectez-vous pour ouvrir votre session</p>

                    <form action="#">
                        <div className="mb-24">
                            <label for="fname" className="form-label mb-8 h6">Email</label>
                            <div className="position-relative">
                                <input type="text" className="form-control py-11 ps-40" id="fname" onChange={(e) => { setForm({ ...form, phone: e.target.value }) }} placeholder="Entrer votre email" />
                                <span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-user"></i></span>
                            </div>
                        </div>
                        <div className="mb-24">
                            <label for="current-password" className="form-label mb-8 h6">Mot de passe</label>
                            <div className="position-relative">
                                <input type="password" className="form-control py-11 ps-40" onChange={(e) => { setForm({ ...form, password: e.target.value }) }} id="current-password" placeholder="Entrer votre mot de passe" />
                                <span className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph ph-eye-slash" id="#current-password"></span>
                                <span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-lock"></i></span>
                            </div>
                        </div>
                        <button type="button" className="btn btn-main rounded-pill w-100" onClick={handleSubmit}>Se connecter</button>
                    </form>
                </div>
            </div>
        </section>
    </>
}

export default LoginPage