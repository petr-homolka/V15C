import React, { useState } from 'react';

export function SuperAdminView() {
  const [packages, setPackages] = useState([
    {
      id: 'pkg_basic',
      name: 'Balíček BASIC',
      price: 1490,
      period: 'měsíčně / org',
      features: ['Správa spisů rodin a dětí', 'Bi-monthly návštěvy', 'Základní AI zápisník']
    },
    {
      id: 'pkg_standard',
      name: 'Balíček STANDARD',
      price: 2990,
      period: 'měsíčně / org',
      features: ['Vše z BASIC', 'Klientský portál pěstounů', 'Generátor OSPOD reportů', 'AI Doporučovač kurzů']
    },
    {
      id: 'pkg_premium',
      name: 'Balíček PREMIUM UNLIMITED',
      price: 4990,
      period: 'měsíčně / org',
      features: ['Vše ze STANDARD', 'Exit Transfer se SMS 2FA', 'AES-256 Šifrované zálohy', 'PWA Offline synchronizace', 'Účetní exporty SPVPP']
    }
  ]);

  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCreatePackage = (e) => {
    e.preventDefault();
    if (!newPkgName || !newPkgPrice) return;
    const newPkg = {
      id: `pkg_${Date.now()}`,
      name: newPkgName,
      price: parseInt(newPkgPrice, 10),
      period: 'měsíčně / org',
      features: ['Vlastní kombinace služeb', 'AI Asistent']
    };
    setPackages(prev => [...prev, newPkg]);
    setNewPkgName('');
    setNewPkgPrice('');
    setSuccessMsg("Nový placený balíček byl úspěšně vytvořen.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="routine-page-container font-sans">
      {successMsg && (
        <div className="routine-card p-3 bg-[var(--routine-green-light)] border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium routine-flex-center">
          <i className="las la-check-circle text-base" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Routine Header */}
      <div className="routine-flex-between pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="routine-header-title">
            Superadmin — Licenční balíčky
          </h1>
          <p className="routine-header-sub">
            Správa tarifů a funkcí pro doprovázející organizace | Routine.co Format
          </p>
        </div>

        <span className="routine-badge routine-badge-coral font-mono text-xs">
          Superadmin přístup
        </span>
      </div>

      {/* Create Package Card */}
      <div className="routine-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
          Vytvořit nový placený balíček služeb
        </h3>

        <form onSubmit={handleCreatePackage} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              Název balíčku
            </label>
            <input
              type="text"
              className="routine-input"
              placeholder="Např. Balíček SPECIAL OSPOD"
              value={newPkgName}
              onChange={(e) => setNewPkgName(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              Cena (Kč / měsíc)
            </label>
            <input
              type="number"
              className="routine-input"
              placeholder="3490"
              value={newPkgPrice}
              onChange={(e) => setNewPkgPrice(e.target.value)}
            />
          </div>

          <button type="submit" className="routine-btn-primary w-full sm:w-auto justify-center py-2.5">
            <i className="las la-plus-circle text-base" />
            Vytvořit balíček
          </button>
        </form>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="routine-card p-6 flex flex-col justify-between space-y-4 border-t-4 border-t-[var(--routine-coral)]">
            <div className="space-y-3">
              <span className="routine-badge routine-badge-coral font-mono text-[10px]">GLOBÁLNÍ BALÍČEK</span>
              <h3 className="text-base font-bold text-[var(--routine-text-primary)]">{pkg.name}</h3>

              <div className="text-2xl font-bold font-mono text-[var(--routine-coral)]">
                {pkg.price.toLocaleString('cs-CZ')} Kč <span className="text-xs font-normal text-[var(--routine-text-secondary)]">/ {pkg.period}</span>
              </div>

              <ul className="space-y-1.5 text-xs text-[var(--routine-text-body)]">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <i className="las la-check text-[var(--routine-green)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="routine-btn-secondary w-full justify-center text-xs py-2" onClick={() => alert(`Správa balíčku ${pkg.name}`)}>
              Upravit balíček
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuperAdminView;
