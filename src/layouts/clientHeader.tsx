import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

const HeaderClient = () => {
    useEffect(() => {
        // Load Swiper.js
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <Helmet>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet"
                />
                <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
                    crossOrigin="anonymous"
                />
                <link rel="stylesheet" href="/includes/dist/style.css" />
                <style>{`
                    body {
                        font-family: "Montserrat", sans-serif;
                    }
                `}</style>
            </Helmet>
        </>
    );
};

export default HeaderClient;
