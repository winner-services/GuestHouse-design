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
                    className="users arrow-down-icon border border-gray-200 rounded-pill p-4 d-inline-block pe-40 position-relative"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="position-relative">
                        <img src="/assets/images/default-user.png" alt="Image" className="h-32 w-32 rounded-circle" />
                        <span
                            className="activation-badge w-8 h-8 position-absolute inset-block-end-0 inset-inline-end-0"></span>
                    </span>
                </button>
                <div className="dropdown-menu dropdown-menu--lg border-0 bg-transparent p-0">
                    <div className="card border border-gray-100 rounded-12 box-shadow-custom">
                        <div className="card-body">
                            <div className="flex-align gap-8 mb-20 pb-20 border-bottom border-gray-100">
                                <img src="/assets/images/default-user.png" alt=""
                                    className="w-54 h-54 rounded-circle" />
                                <div className="">
                                    <h4 className="mb-0">{userdata.name}</h4>
                                    <p className="fw-medium text-13 text-gray-200">{userdata.email}</p>
                                </div>
                            </div>
                            <ul className="max-h-270 overflow-y-auto scroll-sm pe-4">
                                <li className="pt-0">
                                    <a href="#" onClick={logout}
                                        className="py-12 text-15 px-20 hover-bg-danger-50 text-gray-300 hover-text-danger-600 rounded-8 flex-align gap-8 fw-medium text-15">
                                        <span className="text">Se Deconnecter</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* User Profile Start */}

        </div >
    </>
}

export default HeaderPage