import { useContext } from "react";
import { MainContext } from "../../../config/MainContext";

function HeaderPage() {
    const { logout } = useContext(MainContext);
    let userdata = JSON.parse(localStorage.getItem('user'))

    return <>
        <div className="top-navbar flex-between gap-16">

            <div className="flex-align gap-16">
                {/* Toggle Button Start */}
                <button type="button" className="toggle-btn d-xl-none d-flex text-26 text-gray-500"><i
                    className="ph ph-list"></i></button>
                {/* Toggle Button End */}

                <form action="#" className="w-350 d-sm-block d-none">
                    <div className="position-relative">
                        <button type="submit" className="input-icon text-xl d-flex text-gray-100 pointer-event-none"><i
                            className="ph ph-magnifying-glass"></i></button>
                        <input type="text"
                            className="form-control ps-40 h-40 border-transparent focus-border-main-600 bg-main-50 rounded-pill placeholder-15"
                            placeholder="Chercher..." />
                    </div>
                </form>
            </div>


            {/* User Profile Start */}
            <div className="dropdown">
                <button
                    onClick={logout}
                    className="users border border-gray-200 rounded-pill p-8 d-inline-block position-relative"
                    type="button">
                    <span className="position-relative">
                        <span className="text">Se Deconnecter</span>
                    </span>
                </button>
            </div>
            {/* User Profile Start */}
        </div >
    </>
}

export default HeaderPage