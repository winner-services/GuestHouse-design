function SidebarPage() {
    let userdata = JSON.parse(localStorage.getItem('user'))
    let permissions = userdata.permissions

    return <>
        <aside className="sidebar">
            <button type="button"
                className="sidebar-close-btn text-gray-500 hover-text-white hover-bg-main-600 text-md w-24 h-24 border border-gray-100 hover-border-main-600 d-xl-none d-flex flex-center rounded-circle position-absolute"><i
                    className="ph ph-x"></i></button>

            <a href="#"
                className="sidebar__logo text-center p-20 position-sticky inset-block-start-0 bg-white w-100 z-1 pb-10">
                {/* <img src="/assets/images/logo/logo.png" alt="Logo"/> */}
                <h4 className="text-success">JOHN SERVICES MOTEL</h4>
            </a>

            <div className="sidebar-menu-wrapper overflow-y-auto scroll-sm">
                <div className="p-20 pt-10">
                    <ul className="sidebar-menu">
                        <li className="sidebar-menu__item">
                            <a href="/main" className="sidebar-menu__link">
                                <span className="icon"><i className="ph ph-squares-four"></i></span>
                                <span className="text">Tableau de bord</span>
                            </a>
                        </li>
                        {permissions.includes("Gérer Partenaires") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Partenaires</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/clients" className="sidebar-submenu__link"> Clients </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/suppliers" className="sidebar-submenu__link"> Fournisseurs </a>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Magasin") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Magasin</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/products" className="sidebar-submenu__link"> Produits </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/pourchases" className="sidebar-submenu__link"> Approvisionnements </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/sortie-stock" className="sidebar-submenu__link"> Sortie Stock </a>
                                    </li>
                                </ul>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer Cuisine") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Cuisine</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/comand-kitchen" className="sidebar-submenu__link"> Commandes </a>
                                    </li>
                                </ul>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer Fournitures") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Fournitures</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/fournitures" className="sidebar-submenu__link"> Autres Fournitures</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/fournitures-approvisionement" className="sidebar-submenu__link">Approvisionnement</a>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Hôtellerie") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Hôtellerie</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/affectations-chambres" className="sidebar-submenu__link"> Affectations </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/affectations-chambres-historique" className="sidebar-submenu__link"> Historique </a>
                                    </li>
                                </ul>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer BarResto") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Restaurant</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/restaurant-supply" className="sidebar-submenu__link"> Approvisionnements </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/ventes" className="sidebar-submenu__link">Point de Vente </a>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Comptabilité") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-graduation-cap"></i></span>
                                    <span className="text">Comptabilité</span>
                                </a>

                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/transactions-tresorerie" className="sidebar-submenu__link"> Transactions </a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/compte-tresorerie" className="sidebar-submenu__link"> Comptes de tresorerie</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/compte-comptables" className="sidebar-submenu__link"> Comptes comptables</a>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Rapports") ? (
                            <li className="sidebar-menu__item">
                                <a href="/main/rapports" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-squares-four"></i></span>
                                    <span className="text">Rapports</span>
                                </a>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer Paramètres") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-shield-check"></i></span>
                                    <span className="text">Parametres</span>
                                </a>
                                <ul className="sidebar-submenu">
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/roles-users" className="sidebar-submenu__link">Roles</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/users" className="sidebar-submenu__link">Utilisateurs</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/departements" className="sidebar-submenu__link">Departements</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/rooms" className="sidebar-submenu__link">Chambres</a>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <a href="/main/devises" className="sidebar-submenu__link">Devises</a>
                                    </li>
                                </ul>
                            </li>
                        ) : null}


                    </ul>
                </div>
            </div>

        </aside>
    </>
}

export default SidebarPage