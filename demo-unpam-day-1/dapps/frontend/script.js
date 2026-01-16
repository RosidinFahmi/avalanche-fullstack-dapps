const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const identityEl = document.getElementById("identity");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const errorEl = document.getElementById("error");

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

// Data peserta
const FULL_NAME = "Rosidin Fahmi Abdillah";
const NIM = "221011402068";

let state = {
  connected: false,
  address: "",
  chainId: "",
  isFuji: false,
  uiResetMode: false, 
};

function setStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || "";
}

function showError(message) {
  if (!errorEl) return;
  errorEl.style.display = "block";
  errorEl.textContent = message;
}

function clearError() {
  if (!errorEl) return;
  errorEl.style.display = "none";
  errorEl.textContent = "";
}

function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr || "-";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function setIdentity() {
  if (identityEl) identityEl.textContent = FULL_NAME + " (" + NIM + ")";
}

function formatAvaxBalance(balanceWeiHex) {
  const wei = BigInt(balanceWeiHex);
  const WEI = 10n ** 18n;

  const whole = wei / WEI;
  const frac = wei % WEI;

  // 4 desimal
  const frac4 = (frac / (10n ** 14n)).toString().padStart(4, "0");
  return whole.toString() + "." + frac4;
}

async function getChainId() {
  return await window.ethereum.request({ method: "eth_chainId" });
}

async function getAccounts() {
  return await window.ethereum.request({ method: "eth_accounts" });
}

async function requestAccounts() {
  return await window.ethereum.request({ method: "eth_requestAccounts" });
}

async function getBalance(address) {
  return await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });
}

function resetUI() {
  state.connected = false;
  state.address = "";
  state.chainId = "";
  state.isFuji = false;
  state.uiResetMode = true;

  clearError();
  setStatus("Not Connected", "");
  addressEl.textContent = "-";
  if (identityEl) identityEl.textContent = "-";
  networkEl.textContent = "-";
  balanceEl.textContent = "-";

  connectBtn.disabled = false;
  connectBtn.textContent = "Connect Wallet";
}

// Render UI berdasarkan data wallet
async function refreshWalletInfo() {
  clearError();
  setIdentity();

  if (typeof window.ethereum === "undefined") {
    resetUI();
    showError("Wallet tidak terdeteksi. Install Core Wallet atau MetaMask.");
    return;
  }

  try {
    const chainId = await getChainId();
    const accounts = await getAccounts();
    const address = accounts && accounts[0] ? accounts[0] : "";

    
    if (state.uiResetMode) {
      resetUI();
      return;
    }

    state.chainId = chainId;
    state.address = address;
    state.connected = !!address;
    state.isFuji = chainId === AVALANCHE_FUJI_CHAIN_ID;

    if (!state.connected) {
      setStatus("Not Connected", "");
      addressEl.textContent = "-";
      networkEl.textContent = "-";
      balanceEl.textContent = "-";
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect Wallet";
      return;
    }

    // Connected UI
    addressEl.textContent = shortenAddress(state.address);

    if (state.isFuji) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      setStatus("Connected ✅", "#4cd137");

      const balanceWei = await getBalance(state.address);
      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "Wrong Network ❌";
      balanceEl.textContent = "-";
      setStatus("Please switch to Avalanche Fuji", "#fbc531");
    }

    // Disable button setelah connect
    connectBtn.disabled = false;          
    connectBtn.textContent = "Connected"; 
  } catch (e) {
    setStatus("Connection Error ❌", "#ff6b6b");
    balanceEl.textContent = "-";
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
    showError(e?.message || "Terjadi error saat membaca data wallet.");
  }
}

// Toggle connect
async function connectWallet() {
  clearError();

  // Kalau sedang tampil Connected, klik lagi = reset UI
  if (connectBtn.textContent === "Connected") {
    resetUI();
    return;
  }

  // Kalau UI sedang reset mode, klik connect = tampilkan lagi data wallet
  state.uiResetMode = false;

  if (typeof window.ethereum === "undefined") {
    showError("Wallet tidak terdeteksi. Install Core Wallet atau MetaMask.");
    return;
  }

  try {
    setStatus("Connecting...", "#fbc531");

    await requestAccounts();
    await refreshWalletInfo();
  } catch (e) {
    if (e && e.code === 4001) {
      setStatus("Not Connected", "");
      showError("Permintaan koneksi ditolak.");
      return;
    }
    setStatus("Connection Failed ❌", "#ff6b6b");
    showError(e?.message || "Gagal connect wallet.");
  }
}

// Listen events
function setupListeners() {
  if (!window.ethereum || !window.ethereum.on) return;

  window.ethereum.on("accountsChanged", async () => {
    // kalau UI lagi reset mode, biarkan tetap reset
    if (state.uiResetMode) return;
    await refreshWalletInfo();
  });

  window.ethereum.on("chainChanged", async () => {
    if (state.uiResetMode) return;
    await refreshWalletInfo();
  });
}

connectBtn.addEventListener("click", connectWallet);

// Auto load
refreshWalletInfo();
setupListeners();