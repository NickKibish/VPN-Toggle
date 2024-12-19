import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { NetworkService, NetworkServiceStatus } from "../../../shared/model";
import { NetworkServiceManager } from "../service/network_service";


@action({ UUID: "com.nick-kibysh.vpn-toggle.toggle-connection" })
export class ToggleNetworkConnection extends SingletonAction<TogglerSettings> {
    private networkService: NetworkServiceManager = new NetworkServiceManager();
    
    override onWillAppear(ev: WillAppearEvent<TogglerSettings>): Promise<void> | void {
        
    }
    
    override onWillDisappear(ev: WillDisappearEvent<TogglerSettings>): Promise<void> | void {
        
    }
}

type TogglerSettings = {
    network?: NetworkService;
    status?: NetworkServiceStatus;
    host?: string;
    port?: number;
    error?: string;
}