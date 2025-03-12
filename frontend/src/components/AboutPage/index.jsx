import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header showSearch={false} />
      <main className="container mx-auto py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">About Rave-Lite</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Our Project</h2>
          <p className="mb-4">
            Rave Lite is a modern e-commerce platform designed to revolutionize the online shopping experience. Built with the latest technologies and driven by artificial intelligence, Rave Lite offers a seamless and intuitive shopping journey for both customers and businesses. 
            Our platform integrates advanced features such as personalized product recommendations, AI-powered search, and a smooth, responsive interface to ensure that every shopper enjoys a modern, fast, and personalized experience. Whether you're browsing, buying, or selling, 
            Rave Lite is committed to making online shopping smarter, faster, and more enjoyable for everyone.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside mb-4">
            <li>AI-powered product recommendations</li>
            <li>Scalable and reliable cloud-based infrastructure</li>
            <li>Real-time inventory management</li>
            <li>Secure payment processing</li>
            <li>Personalized user experiences</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
          <p className="mb-4">
            Our project utilizes a variety of cloud and AI technologies, including:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>AWS (Amazon Web Services) for cloud infrastructure</li>
            <li>React for frontend development</li>
            <li>Node.js and Express for backend services</li>
            <li>Machine Learning models for product recommendations</li>
            <li>Natural Language Processing for customer support chatbot</li>
          </ul>
          {/* <h2 className="text-2xl font-semibold mb-4">About The Cloud Bootcamp</h2>
          <p className="mb-4">
            The Cloud Bootcamp is a premier provider of hands-on training in cloud computing and artificial intelligence. Through projects like Rave Lite, they offer students practical experience with real-world applications of cloud and AI technologies.
          </p> */}
          <p>
            For more information about the platform, please contact <a href="https://www.linkedin.com/in/ishaq-ansari/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Ishaq Ansari</a> @ ishaq.ansari.work@gmail.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;