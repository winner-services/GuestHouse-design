import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import ProductForm from "./components/ProductForm"
import { Dropdown } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ProductPage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleProduct, setsingleProduct] = useState({})
    const [data, setData] = useState([])
    const [deviseData, setDeviseData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseValue, setDeviseValue] = useState({})

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(singleProduct).forEach(function (key, index) {
            delete singleProduct[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getProductData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const modelUpdate = (model) => {
        setsingleProduct(model)
        seteFormVisible(true)
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        let result = Number(value) * Number(deviseValue?.conversion_amount)
        return `${result} ${deviseValue?.symbol}`
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1, term);
        } else {
            getData();
        }
    };

    const getResult = (pages) => {

        if (!pages) {
            pages = 1;
        }
        getData(pages);
    }

    const downloadReport = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getProductReport`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {

                const printData = res.data;
                var logo = new Image()
                logo.src = '/assets/images/logo.png'
                const pdf = new jsPDF();
                pdf.setProperties({
                    title: "Liste des produits"
                })

                // Add images and text to the PDF
                pdf.addImage(logo, 'png', 97, 3, 12, 20)
                pdf.setFontSize(16);
                pdf.setFont('custom', 'bold');
                pdf.text('JOHN SERVICES MOTEL', 70, 27);
                pdf.setFontSize(12);
                pdf.setFont('custom', 'normal');
                pdf.text('Q.les volcans, av.les messagers N° 13-B', 69, 32);
                pdf.text('RCCM: 22-A-01622', 86, 37);
                pdf.text('Impôt : A2315632S', 87, 42);
                pdf.text('+243997163443', 90, 47);
                pdf.text('johnservicesmotel@gmail.com', 83, 52);

                pdf.setFontSize(15);
                pdf.setFont('custom', 'bold');
                pdf.text('LISTE DES PRODUITS', 77, 60);

                pdf.setFontSize(10);
                pdf.setFont('custom', 'bold');

                // Line width in units (you can adjust this)
                pdf.setLineWidth(0.1);

                // Generate AutoTable for item details
                const itemDetailsRows = printData?.map((item, index) => [
                    (index + 1).toString(),
                    item.designation.toString(),
                    item.quantity+" "+item.unite_designation?.toString(),
                    item.purchase_price+" $"?.toString(),
                    item.selling_price+" $"?.toString(),
                ]);
                const itemDetailsHeaders = ['No', 'Designation', 'Quantite', 'Prix Achat', 'Prix Vente'];
                const columnWidths = [15, 55, 30, 40, 45];
                // Define table styles
                const headerStyles = {
                    fillColor: [240, 240, 240],
                    textColor: [0],
                    fontFamily: 'Newsreader',
                    fontStyle: 'bold',
                };
                pdf.setFont('Newsreader');
                const itemDetailsYStart = 65;
                pdf.autoTable({
                    head: [itemDetailsHeaders],
                    body: itemDetailsRows,
                    tableLineColor: 200,
                    startY: itemDetailsYStart,
                    headStyles: {
                        fillColor: headerStyles.fillColor,
                        textColor: headerStyles.textColor,
                        fontStyle: headerStyles.fontStyle,
                        fontSize: 10,
                        font: 'Newsreader',
                        halign: 'left',
                    },
                    columnStyles: {
                        0: { cellWidth: columnWidths[0] },
                        1: { cellWidth: columnWidths[1] },
                        2: { cellWidth: columnWidths[2] },
                        3: { cellWidth: columnWidths[3] },
                        4: { cellWidth: columnWidths[4] },
                    },
                    alternateRowStyles: { fillColor: [255, 255, 255] },
                    bodyStyles: {
                        fontSize: 10,
                        font: 'Newsreader',
                        cellPadding: { top: 1, right: 5, bottom: 1, left: 2 },
                        textColor: [0, 0, 0],
                        rowPageBreak: 'avoid',
                    },
                    margin: { top: 10, left: 13 },
                });

                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.line(10, 283, 200, 283)
                    pdf.setPage(i);
                    pdf.setFont('Newsreader');
                    pdf.text(
                        `Page ${i} sur ${totalPages}`,
                        185,
                        pdf.internal.pageSize.getHeight() - 5
                    );
                }

                // Save the PDF 
                pdf.save(`Liste des produits.pdf`);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
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
                            <li><span className="text-main-600 fw-normal text-15">Liste des produits</span></li>
                        </ul>
                    </div>
                    {/* Breadcrumb End */}

                    {/* Breadcrumb Right Start */}
                    <div className="flex-align gap-8 flex-wrap">
                        <div className="position-relative text-gray-500 flex-align gap-4 text-13">
                            <input type="text" className="form-control" placeholder="Chercher..." onChange={(e) => { searchDataFn(e.target.value) }} />
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
                            <button className="btn btn-success me-1" onClick={() => downloadReport()}>Telecharger</button>
                            <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
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
                                    <th className="h6 text-gray-300">Image</th>
                                    <th className="h6 text-gray-300">Designation</th>
                                    <th className="h6 text-gray-300">Qté minimale</th>
                                    <th className="h6 text-gray-300">Quantité</th>
                                    <th className="h6 text-gray-300">Prix d'achat</th>
                                    <th className="h6 text-gray-300">Prix de vente</th>
                                    <th className="h6 text-gray-300">Categorie</th>
                                    <th className="h6 text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300" style={{ width: 70 }}><img src={item.image ? `${ImageUrl}/${item.image}` : `/assets/images/default-product.png`} alt="" style={{ width: '100%' }} /></span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.designation}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.minimum_quantity} {item.unite}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unite}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.purchase_price)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.selling_price)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.categorie}</span></td>
                                                <td>
                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={9}>
                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                        </td>
                                    </tr>)

                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination mt-3 mb-8">
                        <Pagination data={entries} limit={2} onPageChange={getResult} />
                    </div>

                </div>

            </div>
        </>
    } else {
        return <ProductForm hideForm={hideForm} singleProduct={singleProduct} />
    }

}

export default ProductPage