import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { NetworkService, NetworkServiceStatus } from "../../../shared/model";
import { NetworkServiceManager } from "../service/network_service";


@action({ UUID: "com.nick-kibysh.vpn-toggle.toggle-connection" })
export class ToggleNetworkConnection extends SingletonAction<TogglerSettings> {
    private networkService: NetworkServiceManager = new NetworkServiceManager();
    
    override onWillAppear(ev: WillAppearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action appeared');
    }
    
    override onWillDisappear(ev: WillDisappearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action disappeared');
    }

    override onDidReceiveSettings(ev: DidReceiveSettingsEvent<TogglerSettings>): Promise<void> {
        streamDeck.logger.info('Settings received');
        return new Promise(async (resolve, reject) => {
            const globalSettings = await streamDeck.settings.getGlobalSettings();
            const { settings } = ev.payload;
            
            if (settings.network) {
                // streamDeck.logger.info('Selected network:');
                streamDeck.logger.debug('Chosen network:', JSON.stringify(settings.network));
            } else {
                streamDeck.logger.info('No network selected');
                streamDeck.logger.info('Settings:', JSON.stringify(settings));
            }

            if (globalSettings.port) {
                streamDeck.logger.info('Port:', globalSettings.port);
            } else {
                streamDeck.logger.info('Global Settings: ');
                streamDeck.logger.info(globalSettings);
            }


            resolve();
        });
    }
}

type TogglerSettings = {
    network?: NetworkService;
    status?: NetworkServiceStatus;
    error?: string;
}