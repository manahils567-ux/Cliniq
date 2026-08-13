import React from 'react';
import Blog from '../Blog/Blog';
import CqSiteFooter from '../../Shared/CqSiteFooter/CqSiteFooter';
import Testimonial from '../Testimonial/Testimonial';
import ClinicAndSpecialities from '../ClinicAndSpecialities/ClinicAndSpecialities';
import BookDoctor from '../BookOurDoctor/BookDoctor';
import Available from '../AvailableFeatures/Available';
import HeroSection from '../HeroSection/HeroSection';
import InfoPage from '../InfoPage/InfoPage';
import Header from '../../Shared/Header/Header';
import Service from '../Services/Service';
import Gallery from '../Gallery/Gallery';
import OurDoctors from '../OurDoctor/OurDoctors';

const Home = () => {
    return (
        <>
            <Header />
            <HeroSection />
            <InfoPage />
            <Service />
            <ClinicAndSpecialities />
            <BookDoctor />
            <Blog />
            <Available />
            <OurDoctors/>
            <Testimonial />
            <Gallery/>
            <CqSiteFooter />
        </>
    );
};

export default Home;