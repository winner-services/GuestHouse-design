import { useContext, useEffect, useState } from "react"
import CanvasJSReact from '@canvasjs/react-charts';
import { MainContext } from "../../config/MainContext";
import Pagination from "../../pagination/Pagination"
import { Dropdown } from 'react-bootstrap';

function DashboardPage() {
    let userdata = JSON.parse(localStorage.getItem('user'))
    let permissions = userdata.permissions
    var CanvasJS = CanvasJSReact.CanvasJS;
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    const { setLoader } = useContext(MainContext);
    const [topRooms, setTopRooms] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [saleStatistic, setSaleStatistic] = useState([])
    const [productAlert, setProductAlert] = useState([])
    const [productAlertEntries, setProductAlertEntries] = useState([])
    const [deviseData, setDeviseData] = useState([])
    const [deviseValue, setDeviseValue] = useState({})
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;

    const [mainData, setMainData] = useState({
        recette_chambre: 0,
        recette_produit: 0,
        total_depense: 0,
        total_vente: 0
    })
    const [form, setForm] = useState({
        first_date: now.getFullYear() + '-' + month + '-01',
        end_date: today,
    })

    const options_sold_product = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", //"light1", "dark1", "dark2"
        title: {
            text: "Produits les plus vendus"
        },
        axisY: {
            includeZero: true
        },
        data: [{
            type: "pie", //change type to bar, line, area, pie, etc
            indexLabelFontColor: "#5A5757",
            indexLabelPlacement: "outside",
            dataPoints: topProducts
        }]
    }

    const options_sold_rooms = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", //"light1", "dark1", "dark2"
        title: {
            text: "Chambres les plus frequentées"
        },
        axisY: {
            includeZero: true
        },
        data: [{
            type: "pie", //change type to bar, line, area, pie, etc
            //indexLabel: "{y}", //Shows y value on all Data Points
            indexLabelFontColor: "#5A5757",
            indexLabelPlacement: "outside",
            dataPoints: topRooms
        }]
    }

    const options_statistic_vente = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", //"light1", "dark1", "dark2"
        title: {
            text: "Statistique des ventes"
        },
        axisY: {
            includeZero: true
        },
        data: [{
            type: "area", //change type to bar, line, area, pie, etc
            indexLabelFontColor: "#5A5757",
            indexLabelPlacement: "outside",
            dataPoints: saleStatistic
        }]
    }

    const getData = async (page = 1, form_data = form) => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDashBoardData?page=${page}`, {
                method: 'POST',
                headers: headerRequest,
                body: JSON.stringify(form_data),
            });
            const res = await response.json();
            if (res) {
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
                setTopRooms(res.top5Rooms)
                setTopProducts(res.Top5Products)
                setSaleStatistic(res.salesStatistics)
                setProductAlert(res.alert_stock.data)
                setProductAlertEntries(res.alert_stock)
                setMainData({
                    ...mainData,
                    total_depense: res.total_depense,
                    total_vente: res.total_vente,
                    recette_chambre: res.recette_chambre,
                    recette_produit: res.recette_produit
                })
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        if (value) {
            let result = Number(value) * Number(deviseValue?.conversion_amount)
            return `${result} ${deviseValue?.symbol}`
        } else {
            return `0 $`
        }

    }

    const change_first_date = (start_date) => {
        setForm({ ...form, first_date: start_date })
        let form_current = {
            first_date: start_date,
            end_date: form.end_date
        }
        getData(1, form_current)
    }

    const change_end_date = (end_date) => {
        setForm({ ...form, end_date: end_date })
        let form_current = {
            first_date: form.first_date,
            end_date: end_date
        }
        getData(1, form_current)
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


    return <>

        <div className="dashboard-body">

            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Tableau de bord</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div className="position-relative text-gray-500 flex-align gap-4 text-13">
                        <input type="date" className="form-control" value={form.first_date} onChange={(e) => { change_first_date(e.target.value) }} />
                        <i className="ph ph-arrow-right"></i>
                        <input type="date" className="form-control" value={form.end_date} onChange={(e) => { change_end_date(e.target.value) }} />
                    </div>
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                        <Dropdown className="me-1">
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                {deviseValue ? deviseValue.symbol : ''}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {deviseData.map((item, index) => (
                                    <Dropdown.Item key={index} onClick={() => changeDevise(item)}>
                                        {item.symbol}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>
            {permissions.includes("Voir Eléments Tableau de Bord") ? (
                <div className="row gy-4">
                    <div className="col-lg-12">
                        {/* Widgets Start */}
                        <div className="row gy-4">
                            <div className="col-xxl-3 col-sm-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="mb-2">{get_net_value(mainData.recette_produit)}</h4>
                                        <span className="text-gray-600">Recette Vente</span>
                                        <div className="flex-between gap-8 mt-16">
                                            <span
                                                className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-main-two-600 text-white text-2xl"><i
                                                    className="ph-fill ph-shopping-cart"></i></span>
                                            <div id="earned-certificate" className="remove-tooltip-title rounded-tooltip-value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-3 col-sm-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="mb-2">{get_net_value(mainData.recette_chambre)}</h4>
                                        <span className="text-gray-600">Recette Chambre</span>
                                        <div className="flex-between gap-8 mt-16">
                                            <span
                                                className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-main-two-600 text-white text-2xl"><i
                                                    className="ph-fill ph-bed"></i></span>
                                            <div id="earned-certificate" className="remove-tooltip-title rounded-tooltip-value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-3 col-sm-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="mb-2">{get_net_value(mainData.total_vente)}</h4>
                                        <span className="text-gray-600">Total Dette Clients</span>
                                        <div className="flex-between gap-8 mt-16">
                                            <span
                                                className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-purple-600 text-white text-2xl">
                                                <i className="ph-fill ph-users-three"></i></span>
                                            <div id="course-progress" className="remove-tooltip-title rounded-tooltip-value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-3 col-sm-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="mb-2">{get_net_value(mainData.total_depense)}</h4>
                                        <span className="text-gray-600">Total Depenses</span>
                                        <div className="flex-between gap-8 mt-16">
                                            <span
                                                className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-warning-600 text-white text-2xl"><i
                                                    className="ph-fill ph-money"></i></span>
                                            <div id="community-support" className="remove-tooltip-title rounded-tooltip-value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Widgets End */}
                    </div>

                </div>
            ) : null}


            <div className="row">
                <div className="col-lg-4">
                    <div className="card mt-24">
                        <div className="card-body">
                            <CanvasJSChart options={options_sold_product} />
                        </div>
                    </div>
                    <div className="card mt-24">
                        <div className="card-body">
                            <CanvasJSChart options={options_sold_rooms} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card mt-24">
                        <div className="card-body">
                            <CanvasJSChart options={options_statistic_vente} />

                        </div>
                    </div>

                    <div className="card mt-24">
                        <div className="card-body">
                            <div className="mb-20 flex-between flex-wrap gap-8">
                                <h4 className="mb-0">Stock d'alerte</h4>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Produit</th>
                                            <th>Qté Minimale</th>
                                            <th>Qté Restante</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            productAlert.length > 0 ? (
                                                productAlert.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.alert_quantity}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.stock_quantity}</span></td>
                                                    </tr>
                                                ))
                                            ) : (<tr>
                                                <td colSpan={4}>
                                                    <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                </td>
                                            </tr>)

                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="paginate mt-3 mb-8">
                                <Pagination data={productAlertEntries} limit={2} onPageChange={getResult} />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Assignment End */}
    </>
}

export default DashboardPage