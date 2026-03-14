import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, EyeOff, CheckCircle, ArrowRight, Users, Building2, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight mb-6">
                Your Digital Identity, <br />
                <span className="text-teal-600">Securely Locked.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Store your personal documents in a secure vault. Share only what's necessary for verification. Privacy by design, inspired by Web5.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup" className="bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center shadow-lg shadow-blue-900/20">
                  Create Your Locker <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/verify" className="bg-white text-blue-800 border-2 border-blue-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center">
                  Verify a Document
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-12 lg:mt-0 relative"
            >
              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="text-blue-800 h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-900">Aadhaar Card</p>
                      <p className="text-sm text-gray-500">Verified • 2 mins ago</p>
                    </div>
                  </div>
                  <CheckCircle className="text-green-500 h-6 w-6" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-5/6"></div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-500">Trusted by 50+ Orgs</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-100 rounded-full blur-2xl opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Why Choose Identity Locker?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Built with privacy at its core, our platform ensures your data stays yours.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "Secure Storage", desc: "Your documents are encrypted and stored in a secure digital vault." },
              { icon: EyeOff, title: "Privacy Controlled", desc: "Share only specific fields for verification. Hide sensitive details like address." },
              { icon: CheckCircle, title: "Instant Verification", desc: "Third parties can verify your identity instantly without full data access." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-blue-800 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">Empowering Ecosystems</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
            <div className="flex flex-col items-center">
              <Building2 className="h-12 w-12 mb-4" />
              <p className="font-medium">Universities</p>
            </div>
            <div className="flex flex-col items-center">
              <Banknote className="h-12 w-12 mb-4" />
              <p className="font-medium">Banks</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 mb-4" />
              <p className="font-medium">Employers</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 mb-4" />
              <p className="font-medium">Govt Agencies</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
