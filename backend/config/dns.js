import dns from 'dns';

// Optional DNS override. Some ISP/router resolvers fail on the SRV lookup behind
// mongodb+srv:// connection strings, which shows up as a database connection timeout.
// Setting DNS_SERVERS (comma-separated, e.g. "1.1.1.1,8.8.8.8") makes Node use those
// resolvers instead. When it is unset the system resolver is used as normal.
const applyDnsOverride = (label = 'Server') => {
  const servers = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    return;
  }

  try {
    dns.setServers(servers);
    console.log(`[${label}] Using custom DNS servers: ${servers.join(', ')}`);
  } catch (error) {
    console.error(`[${label}] Invalid DNS_SERVERS value "${process.env.DNS_SERVERS}": ${error.message}`);
    process.exit(1);
  }
};

export default applyDnsOverride;
