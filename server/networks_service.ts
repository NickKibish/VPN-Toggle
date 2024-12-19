import { exec } from 'child_process';
import { NetworkService, NetworkServiceStatus } from '../shared/model';

export const getNetworks = async (): Promise<NetworkService[]> => {
    return new Promise(async (resolve, reject) => {
        const networkList = await execPromise("/usr/sbin/networksetup -listnetworkserviceorder");
        const denylist = ["Wi-Fi", "Bluetooth PAN", "Thunderbolt Bridge"];
        const lines = networkList.split("\n");
        const serviceLines = lines.slice(1).join("\n");

        const services = parseServices(serviceLines).filter((service) => !denylist.includes(service.name));

        resolve(services);
    });
};


const execPromise = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing command: ${command}`, err);
        reject(err);
      } else if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
        resolve(stdout.trim());
      } else {
        resolve(stdout.trim());
      }
    });

    // Ensure the child process is cleaned up
    child.on("exit", (code) => {
      console.log(`Command exited with code: ${code}`);
    });

    child.on("error", (err) => {
      console.error(`Failed to start command: ${command}`, err);
      reject(err);
    });
  });

const parseServices = (text: string): NetworkService[] => {
    const regex = /\((\d+)\)\s+(.*?)\s+\(Hardware Port: (.*?), Device: (.*?)\)/g;
    return Array.from(text.matchAll(regex)).map((item) => ({
        id: item[1],
        name: item[2],
        hardwarePort: item[3],
        device: item[4],
        status: "disconnected",
        favorite: false, // Default to not favorite
        order: 0, // Default order
    }));
};

const showPPPoEStatus = (networkServiceName: string): Promise<NetworkServiceStatus> => {
    networkServiceName = networkServiceName.replace(/"/g, '\\"');
    return execPromise(
        `/usr/sbin/networksetup -showpppoestatus "${networkServiceName}"`,
    ) as Promise<NetworkServiceStatus>;
};