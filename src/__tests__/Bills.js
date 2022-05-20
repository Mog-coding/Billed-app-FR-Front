/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
// Ajout testing-library userEvent
import userEvent from '@testing-library/dom'
import '@testing-library/jest-dom'


import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills, { default as contBills } from "../containers/Bills.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Ajout test 
      expect(windowIcon).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then click on eye icon should launch modal", () => {
      // charge html BillsUI() dans body
      document.body.innerHTML = BillsUI({ data: bills });

      // instance de class Bills pour utiliser méthodes      // paramètres Bills()
      const localStorage = jest.fn();
      const onNavigate = jest.fn();
      const store = jest.fn();
      // instance
      const billsContainer = new Bills({
        document, onNavigate, store, localStorage
      });

      //simulation click
      const iconEye = screen.getAllByTestId('icon-eye');
      const handleClickIconE = jest.fn(billsContainer.handleClickIconEye(iconEye[0]));
      iconEye[0].addEventListener("click",() => handleClickIconE);
      userEvent.click(iconEye[0]);  

      expect(handleClickIconE).toHaveBeenCalled();
      expect(screen.queryByText("Justificatif")).toBeTruthy();
    })

    /*
    test("Then click on button NewBill should launch function handleClickNewBill()", () => {
      // charge html BillsUI() dans body
      // document.body.innerHTML = BillsUI({ data: bills }) 

      // instance de class Bills pour utiliser méthodes
      // paramètres Bills()
      const localStorage = jest.fn();
      const onNavigate = jest.fn(); 
      const store = jest.fn();
      // instance
      const bills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      //simulation click
      const handleClickNewBil = jest.fn(bills.handleClickNewBill);
      const btnNewBill = screen.getByTestId('btn-new-bill');;
      btnNewBill.addEventListener("click", handleClickNewBil);
      fireEvent.click(btnNewBill);

      expect(handleClickNewBil).toHaveBeenCalled();
      // test si page newBill affichée
      expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();  // <<--- error

      //utilisation du router()? pour simuler changement de page ?
    })
    */



  })
}) 