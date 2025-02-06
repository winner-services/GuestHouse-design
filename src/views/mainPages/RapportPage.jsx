function RapportPage() {
    return <>
        <div className="dashboard-body">

            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                        </li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Rapports</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

            </div>

            <div className="card overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-reponive m-3">
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td><a href="#">Liste des entrees et des sorties</a></td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td><a href="#">Occupation des chambres</a></td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td><a href="#">Liste des depenses</a></td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td><a href="#">Liste des recettes</a></td>
                                </tr>
                                <tr>
                                    <td>5</td>
                                    <td><a href="#">Etat de stock</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default RapportPage