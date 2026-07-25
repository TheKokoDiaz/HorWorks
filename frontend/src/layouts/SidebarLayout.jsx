import Sidebar from '../components/sidebar';

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