export default function AgentDashboard() {
  const clients = [
    {
      id: 1,
      name: "Marie Bouchard",
      address: "4782 rue des Érables, Laval",
      price: "549 000$",
      stage: 2,
      mls: "27084512",
      deadline: "3 jours",
      deadlineType: "Financement",
      type: "acheteur",
      initials: "MB",
      color: "bg-blue-900 text-blue-300",
    },
    {
      id: 2,
      name: "Pierre Lapointe",
      address: "291 boul. des Laurentides, Laval",
      price: "389 000$",
      stage: 4,
      mls: "26991044",
      deadline: "22 mai",
      deadlineType: "Notariat",
      type: "acheteur",
      initials: "PL",
      color: "bg-amber-900 text-amber-300",
    },
    {
      id: 3,
      name: "Sophie Côté",
      address: "1102 rue Principale, Blainville",
      price: "615 000$",
      stage: 1,
      mls: null,
      deadline: null,
      deadlineType: "En attente",
      type: "acheteur",
      initials: "SC",
      color: "bg-gray-800 text-gray-300",
    },
    {
      id: 4,
      name: "Alain Dubois",
      address: "328 av. Papineau, Laval-des-Rapides",
      price: "749 000$",
      stage: 1,
      mls: "28201005",
      deadline: "20 mai",
      deadlineType: "Révision mise en marché",
      type: "vendeur",
      initials: "AD",
      color: "bg-purple-900 text-purple-300",
    },
  ]

  const stages = ["Recherche", "Offre", "Conditions", "Inspection", "Notaire"]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">ImmoPortal</span>
          <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-400 hover:text-white transition">FR</button>
          <span className="text-gray-600">|</span>
          <button className="text-sm text-gray-400 hover:text-white transition">EN</button>
          <div className="w-8 h-8 rounded-full bg-green-900 text-green-300 flex items-center justify-center text-xs font-medium ml-2">JT</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 flex gap-6">
        {["Dossiers", "Inscriptions", "Centris", "Calendrier", "Mise à jour hebdo", "SMS / GHL"].map((tab, i) => (
          <button key={tab} className={`py-3 text-sm border-b-2 transition ${i === 0 ? "border-blue-500 text-white font-medium" : "border-transparent text-gray-400 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Acheteurs actifs", value: "5" },
            { label: "Inscriptions actives", value: "3" },
            { label: "Échéances · 7 jours", value: "4", warn: true },
            { label: "Mises à jour dues", value: "2", danger: true },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.danger ? "text-red-400" : s.warn ? "text-amber-400" : "text-white"}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Suivi des dossiers clients</div>
        <div className="space-y-3">
          {clients.map((c) => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${c.color}`}>
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.address} · {c.price}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">MLS:</span>
                  {c.mls ? (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">{c.mls}</span>
                  ) : (
                    <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">À connecter</span>
                  )}
                  <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full ml-1">{c.type}</span>
                </div>
                {/* Progress dots */}
                <div className="flex items-center gap-1.5 mt-2">
                  {stages.map((s, i) => (
                    <div key={s} className={`w-2.5 h-2.5 rounded-full ${i < c.stage ? "bg-green-500" : i === c.stage ? "bg-blue-500" : "bg-gray-700"}`} title={s} />
                  ))}
                  <span className="text-xs text-blue-400 ml-1">{stages[c.stage]}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {c.deadline ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.deadlineType === "Notariat" ? "bg-blue-900 text-blue-300" : "bg-amber-900 text-amber-300"}`}>
                    {c.deadline}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">En attente</span>
                )}
                <span className="text-xs text-gray-500">{c.deadlineType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
