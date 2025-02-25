import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import SupplierForm from "./components/SupplierForm"

function HistoriqueAffectationModifierChambre() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleSupplier, setsingleSupplier] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(singleSupplier).forEach(function (key, index) {
            delete singleSupplier[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getFraudData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const modelUpdate = (model) => {
        setsingleSupplier(model)
        seteFormVisible(true)
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1,term);
        } else {
            getData();
        }
    };

    function formatDate(date, includeTime = false) {
        const dateObj = new Date(date); // Convert to Date object if it's not already
      
        if (isNaN(dateObj)) {
          return "Invalid Date"; // Handle invalid date inputs
        }
      
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
      
        let formattedDate = `${day}/${month}/${year}`;
      
        if (includeTime) {
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          const seconds = String(dateObj.getSeconds()).padStart(2, '0');
          formattedDate += ` ${hours}:${minutes}:${seconds}`;
        }
      
        return formattedDate;
      }

    const getResult = (pages) => {

        if (!pages) {
            pages = 1;
        }
        getData(pages);
    }

    useEffect(() => {
        getData()
    }, [])


    if (formVisible == false) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Historique des affectations modifiées</span></li>
                        </ul>
                    </div>
                    {/* Breadcrumb End */}

                    {/* Breadcrumb Right Start */}
                    <div className="flex-align gap-8 flex-wrap">
                        <div className="position-relative text-gray-500 flex-align gap-4 text-13">
                            <input type="text" className="form-control" placeholder="Chercher..." onChange={(e) => { searchDataFn(e.target.value) }} />
                        </div>
                    </div>
                    {/* Breadcrumb Right End */}
                </div>


                <div className="card overflow-hidden">
                    <div className="card-body overflow-x-auto">
                        <table id="studentTable" className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th className="fixed-width"> #</th>
                                    <th className="h6 text-gray-300">Reference</th>
                                    <th className="h6 text-gray-300">Date</th>
                                    <th className="h6 text-gray-300">Client</th>
                                    <th className="h6 text-gray-300">Chambre</th>
                                    <th className="h6 text-gray-300">Nombre des jours</th>
                                    <th className="h6 text-gray-300">Prix Unitaire</th>
                                    <th className="h6 text-gray-300">Prix Total</th>
                                    <th className="h6 text-gray-300">Montant payé</th>
                                    <th className="h6 text-gray-300">Reduction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">Du {formatDate(item.start_date)} au {formatDate(item.end_date)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.customer}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.room}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.nombre_nuite} Jours</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.unite_price} $</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.total_amount} $</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.paid_amount} $</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reduction} $</span></td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={10}>
                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                        </td>
                                    </tr>)

                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="paginate mt-3 mb-8">
                        <Pagination data={entries} limit={2} onPageChange={getResult} />
                    </div>
                </div>

            </div>
        </>
    } else {
        return <SupplierForm hideForm={hideForm} singleSupplier={singleSupplier} />
    }

}

export default HistoriqueAffectationModifierChambre