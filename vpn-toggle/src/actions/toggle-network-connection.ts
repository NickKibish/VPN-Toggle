import streamDeck, { action, DidReceiveSettingsEvent, JsonValue, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { NetworkService, NetworkServiceStatus } from "../../../shared/model";
import { NetworkServiceManager } from "../service/network_service";


@action({ UUID: "com.nick-kibysh.vpn-toggle.toggle-connection" })
export class ToggleNetworkConnection extends SingletonAction<TogglerSettings> {
    private networkService: NetworkServiceManager = new NetworkServiceManager();
    private readonly VERSION = "1.0.1";
    
    override onWillAppear(ev: WillAppearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action appeared');
    }
    
    override onWillDisappear(ev: WillDisappearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action disappeared');
    }

    override onSendToPlugin(ev: SendToPluginEvent<JsonValue, TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Send to plugin');
        const payload = ev.payload;
        
    }

    override onDidReceiveSettings(ev: DidReceiveSettingsEvent<TogglerSettings>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const globalSettings = await streamDeck.settings.getGlobalSettings();
            const settings = await ev.action.getSettings();

            const networkId = settings.networkId;
            const portStr = globalSettings.port;
            
            if (portStr) {
                const port = parseInt(portStr as string);
                this.networkService.connectIfNeeded(port);

                if (settings.networkId) {
                    this.networkService.setNetwork(settings.network, settings.networkId);
            }

            resolve();
        });
    }
}

type TogglerSettings = {
    network?: NetworkService;
    networkId?: string;
    status?: NetworkServiceStatus;
    error?: string;
}