import AffectationChambre from "../views/mainPages/AffectationChambre";
import ApprovisionementPage from "../views/mainPages/ApprovisionementPage";
import ChambresPage from "../views/mainPages/ChambresPage";
import ClientPage from "../views/mainPages/ClientPage";
import CommandKitchenPage from "../views/mainPages/CommandKitchenPage";
import CompteComptablePage from "../views/mainPages/CompteComptablePage";
import CompteTresoreriePage from "../views/mainPages/CompteTresoreriePage";
import DashboardPage from "../views/mainPages/DashboardPage";
import DepartementPage from "../views/mainPages/DepartementPage";
import DevisePage from "../views/mainPages/DevisePage";
import FournitureApprovisionementPage from "../views/mainPages/FournitureApprovisionementPage";
import FourniturePage from "../views/mainPages/FourniturePage";
import HistoriqueAffectationChambre from "../views/mainPages/HistoriqueAffectationChambre";
import KitchenSupplyPage from "../views/mainPages/KitchenSupplyPage";
import ProductPage from "../views/mainPages/ProductPage";
import RapportPage from "../views/mainPages/RapportPage";
import RestaurantSupplyPage from "../views/mainPages/RestaurantSupplyPage";
import RoleUserPage from "../views/mainPages/RoleUserPage";
import SortiStock from "../views/mainPages/SortiStock";
import SupplierPage from "../views/mainPages/SupplierPage";
import TransactionTresorerie from "../views/mainPages/TransactionTresorerie";
import UserPage from "../views/mainPages/UserPage";
import VentePage from "../views/mainPages/VentePage";
import NotFound from "../views/NotFound";

const mainRoutes = [
    {path:'/main', element:<DashboardPage />},
    {path:'products', element:<ProductPage />},
    {path:'clients', element:<ClientPage />},
    {path:'suppliers', element:<SupplierPage />},
    {path:'pourchases', element:<ApprovisionementPage />},
    {path:'sortie-stock', element:<SortiStock />},
    {path:'kitchen-supply', element:<KitchenSupplyPage />},
    {path:'comand-kitchen', element:<CommandKitchenPage />},
    {path:'restaurant-supply', element:<RestaurantSupplyPage />},
    {path:'departements', element:<DepartementPage />},
    {path:'rooms', element:<ChambresPage />},
    {path:'users', element:<UserPage />},
    {path:'roles-users', element:<RoleUserPage />},
    {path:'compte-tresorerie', element:<CompteTresoreriePage />},
    {path:'compte-comptables', element:<CompteComptablePage />},
    {path:'transactions-tresorerie', element:<TransactionTresorerie />},
    {path:'ventes', element:<VentePage />},
    {path:'devises', element:<DevisePage />},
    {path:'affectations-chambres', element:<AffectationChambre />},
    {path:'affectations-chambres-historique', element:<HistoriqueAffectationChambre />},
    {path:'rapports', element:<RapportPage />},
    {path:'fournitures', element:<FourniturePage />},
    {path:'fournitures-approvisionement', element:<FournitureApprovisionementPage />},
]

export default mainRoutes