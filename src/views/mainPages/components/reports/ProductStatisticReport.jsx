import { useContext, useEffect, useState } from "react"
import { Dropdown } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MainContext } from "../../../../config/MainContext";

function ProductStatisticReport({ hideForm, form }) {
    const [data, setData] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});

    const getData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getVenteProductStatisticReport`, {
                method: 'POST',
                headers: headerRequest,
                body: JSON.stringify(form)
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
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
        let result = Number(value) * Number(deviseValue?.conversion_amount)
        return `${result} ${deviseValue?.symbol}`
    }

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

    const downloadReport = async () => {
        try {
            const printData = data;
            var logo = new Image()
            logo.src = '/assets/images/logo.png'
            const pdf = new jsPDF();
            pdf.setProperties({
                title: "Statistique des produits"
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
            pdf.text("STATISTIQUE DES PRODUITS DU "+formatDate(form.date_start)+" AU "+formatDate(form.date_end), 30, 60);

            // Line width in units (you can adjust this)
            pdf.setLineWidth(0.1);

            // Generate AutoTable for item details
            const itemDetailsRows = printData?.map((item, index) => [
                (index + 1).toString(),
                item.product.toString(),
                item.quantité_achetée?.toString() + " " + item.unite_designation?.toString(),
                item.quantité_vendue?.toString() + " " + item.unite_designation?.toString(),
                get_net_value(item.total_achat).toString(),
                get_net_value(item.total_ventes).toString(),
                get_net_value(item.total_ventes - item.total_achat).toString(),
            ]);
            const itemDetailsHeaders = ['No', 'Produit', 'Qté Achetée', 'Qté Vendue', 'Prix Total Achat','Prix Total Vente','Benefice'];
            const columnWidths = [15, 30, 25, 25, 30, 30, 30];
            // Define table styles
            const headerStyles = {
                fillColor: [240, 240, 240],
                textColor: [0],
                fontFamily: 'Newsreader',
                fontStyle: 'bold',
            };
            pdf.setFont('Newsreader');
            const itemDetailsYStart = 67;
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
                    5: { cellWidth: columnWidths[5] },
                    6: { cellWidth: columnWidths[6] },
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
            pdf.save(`Statistique des produits.pdf`);
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return <>
        <div className="dashboard-body">
            {/* Breadcrumb Start */}
            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Approvisionnements</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Details</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
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
                        <button className="btn btn-primary" onClick={hideForm}>Retour</button>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>
            {/* Breadcrumb End */}

            <div className="tab-content" id="pills-tabContent">
                {/* My Details Tab start */}
                <div className="tab-pane fade show active" id="pills-details" role="tabpanel"
                    aria-labelledby="pills-details-tab" tabindex="0">
                    <div className="card mt-24">
                        <div className="card-body">
                            <h4 className="d-flex justify-content-center">STATISTIQUE DES PRODUITS DU {formatDate(form.date_start)} AU {formatDate(form.date_end)}</h4>
                            <div className="card overflow-hidden">
                                <div className="card-body overflow-x-auto">
                                    <table id="studentTable" className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Produit</th>
                                                <th className="h6 text-gray-300">Qté Achetée</th>
                                                <th className="h6 text-gray-300">Qté Vendue</th>
                                                <th className="h6 text-gray-300">Prix Total Achat</th>
                                                <th className="h6 text-gray-300">Prix Total Vente</th>
                                                <th className="h6 text-gray-300">Benefice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data.length > 0 ? (
                                                    data.map((item, index) => (
                                                        <tr key={index}>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantité_achetée} {item.unite_designation}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantité_vendue} {item.unite_designation}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_achat)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_ventes)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_ventes - item.total_achat)}</span></td>
                                                        </tr>
                                                    ))
                                                ) : (<tr>
                                                    <td colSpan={7}>
                                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                    </td>
                                                </tr>)
                                            }
                                            {/* {
                                                data.length > 0 ?(
                                                    <tr>
                                                        <td colSpan={4}>
                                                            <strong className="d-flex justify-content-center">TOTAL</strong>
                                                        </td>
                                                        <td><strong>{get_net_value(Object.values(data).reduce((prev, next)=>(Number(prev)+ Number(next["total_achat"])),0))}</strong></td>
                                                        <td><strong>{get_net_value(Object.values(data).reduce((prev, next)=>(Number(prev)+ Number(next["total_ventes"])),0))}</strong></td>
                                                        <td><strong>{get_net_value(Object.values(data).reduce((prev, next)=>(Number(prev)+ (Number(next["total_ventes"])- Number(next["total_achat"]))),0))}</strong></td>
                                                    </tr>
                                                ):null
                                            } */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default ProductStatisticReport