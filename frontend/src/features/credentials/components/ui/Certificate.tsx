'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface CertificateProps {
  holderName?: string;
  holderDocument?: string;
  programTitle?: string;
  dateRange?: string;
  qrUrl?: string;
}

export default function Certificate({
  holderName = 'Álvaro de Jesus Agudelo Vergara',
  holderDocument = '98566340',
  programTitle = 'Método Base de Aceleración — MBA Nivel 1',
  dateRange = 'Marzo - Noviembre 2025 · Marinilla, Antioquia',
  qrUrl,
}: CertificateProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  return (
    <div
      className="relative w-full max-w-6xl mx-auto bg-white shadow-2xl overflow-hidden"
      style={{ aspectRatio: '1.414/1' }}
    >
      {/* Left Side Bar - using the actual SVG asset */}
      <img
        src="/assets/certificate/Leftside.svg"
        alt=""
        className="absolute left-0 top-0 h-full object-cover"
        style={{ width: 'auto' }}
      />

      {/* Right Side Bar - using the actual SVG asset */}
      <img
        src="/assets/certificate/RightSide.svg"
        alt=""
        className="absolute right-0 top-0 h-full object-cover"
        style={{ width: 'auto', right: '-3%' }}
      />

      {/* Top Border - using the actual SVG asset */}
      <img
        src="/assets/certificate/Upperside.svg"
        alt=""
        className="absolute top-0 left-0 w-full object-fill"
      />

      {/* Bottom Border - using the actual SVG asset */}
      <img
        src="/assets/certificate/Downside.svg"
        alt=""
        className="absolute bottom-0 left-0 w-full object-fill"
      />

      {/* Content Area */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-between"
        style={{
          paddingLeft: '24%',
          paddingRight: '24%',
          paddingTop: '8%',
          paddingBottom: '8%',
        }}
      >
        {/* Interactuar Logo */}
        <div className="flex flex-col items-center">
          <img
            src="/assets/interactuar/interactuar-logo.svg"
            alt="Logo Interactuar"
            className="w-16 md:w-20 lg:w-24"
          />
        </div>

        {/* Diploma Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl italic text-[rgb(2,20,66)] font-serif tracking-wide">
            DIPLOMA
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-6 md:w-10 bg-[rgb(32,167,209)]" />
            <span className="text-[7px] md:text-[8px] lg:text-[9px] tracking-[0.1em] md:tracking-[0.14em] text-[rgb(2,20,66)] uppercase">
              de Participación
            </span>
            <div className="h-[1px] w-6 md:w-10 bg-[rgb(32,167,209)]" />
          </div>
        </div>

        {/* Certification Text */}
        <p className="text-[7px] md:text-[8px] text-[rgb(2,20,66)]">
          La Corporación Interactuar certifica que
        </p>

        {/* Name */}
        <div className="flex flex-col items-center gap-0.5">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-[rgb(2,20,66)] text-center">
            {holderName}
          </h2>
          <p className="text-[7px] md:text-[8px] text-gray-500">
            Cédula de ciudadanía: {holderDocument}
          </p>
        </div>

        {/* Program Info */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-[8px] md:text-[9px] font-semibold text-[rgb(2,20,66)]">
            participó y aprobó satisfactoriamente el programa
          </p>
          <h3 className="text-[11px] md:text-xs lg:text-sm font-bold text-[rgb(2,20,66)]">
            {programTitle}
          </h3>
          <p className="text-[7px] md:text-[8px] text-gray-500">{dateRange}</p>
        </div>

        {/* Signatures and Logo Section */}
        <div className="w-full flex items-end justify-center gap-3 md:gap-4 lg:gap-6">
          {/* Left Signature */}
          <div className="flex flex-col items-center text-center flex-1 max-w-[120px]">
            <div className="w-14 md:w-18 lg:w-20 border-t border-[rgb(2,20,66)] mb-1.5" />
            <p className="text-[8px] md:text-[9px] font-bold text-[rgb(234,78,47)]">
              Liliana Y. Tabares Ruiz
            </p>
            <p className="text-[6px] md:text-[7px] text-gray-500 leading-tight">
              Líder Desarrollo Agroempresarial
            </p>
          </div>

          {/* Center: MBA Logo + QR - using the actual SVG assets */}
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <img
              src="/assets/certificate/MBAlogo.svg"
              alt="MBA L-1 Logo"
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
            />
            {qrUrl ? (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center justify-center"
                aria-label="Ver código QR en grande"
              >
                <QRCodeCanvas
                  value={qrUrl}
                  size={20}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={false}
                />
              </button>
            ) : (
              <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            )}
          </div>

          {/* Right Signature */}
          <div className="flex flex-col items-center text-center flex-1 max-w-[120px]">
            <div className="w-14 md:w-18 lg:w-20 border-t border-[rgb(2,20,66)] mb-1.5" />
            <p className="text-[8px] md:text-[9px] font-bold text-[rgb(234,78,47)]">
              Harold Y. Tavera Martínez
            </p>
            <p className="text-[6px] md:text-[7px] text-gray-500 leading-tight">
              Líder Implementación y Avance Empresarial
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-2 text-[8px] md:text-[10px] text-gray-400 text-center">
          interactuar.org.co · República de Colombia
          <br />
          Departamento de Antioquia
        </p>
      </div>

      {/* QR modal overlay */}
      {qrUrl && showQrModal && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCanvas
              value={qrUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
