import streamDeck, { action, DidReceiveSettingsEvent, JsonValue, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { NetworkService, NetworkServiceStatus } from "../../../shared/model";
import { NetworkServiceManager } from "../service/network_service";

@action({ UUID: "com.nick-kibysh.vpn-toggle.toggle-connection" })
export class ToggleNetworkConnection extends SingletonAction<TogglerSettings> {
    private networkService: NetworkServiceManager = new NetworkServiceManager();    
    
    override onWillAppear(ev: WillAppearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action appeared');
        this.updateStreamDeck('disconnected', ev);
        
        this.networkService.setStatusCallback((status: NetworkServiceStatus) => {
            streamDeck.logger.info('Network status changed:', status);
            this.updateStreamDeck(status, ev);
        });

        this.networkService.open()
    }
    
    override onWillDisappear(ev: WillDisappearEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Action disappeared');
        this.networkService.close();
    }

    private updateStreamDeck(status: NetworkServiceStatus, ev: WillAppearEvent<TogglerSettings>): void {

        const imagePath = status === 'connected'
            ? 'imgs/actions/counter/connected.png'
            : 'imgs/actions/counter/disconnected.png';
        
        streamDeck.logger.info('Action appeared2', imagePath);
        
        ev.action.setImage(imagePath); // Update the button icon
    }

    override onKeyDown(ev: KeyDownEvent<TogglerSettings>): Promise<void> | void {
        streamDeck.logger.info('Key down');
        ev.action.setImage('imgs/actions/counter/connecting.png');
    }
}

type TogglerSettings = {
    network?: NetworkService;
    networkId?: string;
    status?: NetworkServiceStatus;
    error?: string;
}