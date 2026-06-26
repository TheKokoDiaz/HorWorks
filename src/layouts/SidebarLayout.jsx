import Sidebar from '../components/Sidebar';

function SidebarLayout({ children }) {

    return (
        <>
            <Sidebar />

            <main>
                {children}
            </main>
        </>
    );
}

export default SidebarLayout;