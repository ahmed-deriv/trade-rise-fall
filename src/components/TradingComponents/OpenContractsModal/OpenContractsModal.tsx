import { Modal } from "@deriv-com/quill-ui";
import { observer } from "mobx-react-lite";
import { tradingPanelStore } from "../../../stores/TradingPanelStore";
import { ContractItem } from "./ContractItem";
import "./OpenContractsModal.scss";

export const OpenContractsModal = observer(() => {
  const { isOpenContractsModalVisible, setOpenContractsModalVisible } =
    tradingPanelStore;

  return (
    <Modal
      className="open-contracts-modal"
      isOpened={isOpenContractsModalVisible}
      toggleModal={() => setOpenContractsModalVisible(false)}
      title="Open Contracts"
    >
      <div className="contracts-container">
        <div className="contracts-list">
          <ContractItem />
        </div>
      </div>
    </Modal>
  );
});
