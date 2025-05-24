import { useContext, useEffect } from "react";
import { MainContext } from "../../../config/MainContext";

function HeaderPage() {
    const { logout } = useContext(MainContext);
    let userdata = JSON.parse(localStorage.getItem('user'))
    const isiPhone = /iPhone/.test(navigator.userAgent);

    const toggleSidebar = () => {
        if (isiPhone) {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active'); // Ensure CSS handles .active
        }
    };

    return <>
        <div className="top-navbar flex-between gap-16 bg-success" >

            <div className="flex-align gap-16">
                {/* Toggle Button Start */}
                <button type="button" className="toggle-btn d-xl-none d-flex text-26 text-white-500" onClick={() => toggleSidebar()}><i
                    className="ph ph-list text-white"></i></button>
                {/* Toggle Button End */}
            </div>


            {/* User Profile Start */}
            <div className="dropdown">
                <button
                    onClick={logout}
                    className="users border border-white-200 rounded-pill p-8 d-inline-block position-relative"
                    type="button">
                    <span className="position-relative">
                        <span className="text text-white">Se Deconnecter</span>
                    </span>
                </button>
            </div>
            {/* User Profile Start */}
        </div >
    </>
}

export default HeaderPage