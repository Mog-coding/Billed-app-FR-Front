/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ROUTES } from '../constants/routes.js'
import store from '../app/Store.js'
import mockStore from "../__mocks__/store"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import router from "../app/Router.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page with loading parameter", () => {
    test("Then loading div should appear", () => {
      document.body.innerHTML = BillsUI({ data: bills, loading: true })
      const loading = screen.getByTestId("test-loading");
      // Si data-testid="test-loading" existe
      expect(loading).toBeTruthy();
    })

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
      // Si windowIcon/bill icon illuminé 
      expect(windowIcon).toHaveClass('active-icon');
    })


    test("Then bill icon in vertical layout should be highlighted", async () => {
      const getSpy = jest.spyOn(store, 'bills')
      const bills = await store.bills();
      expect(getSpy).toHaveBeenCalled();
    })
   

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on eye icon', () => {
      test(('Then, it should launch modal'), () => {
        // Chargement de la page Bills
        document.body.innerHTML = BillsUI({ data: bills })

        // Instance class Bills
        const onNavigate = null;
        const store = jest.fn();
        const localStorage = jest.fn();
        const billsCont = new Bills({ document, onNavigate, store, localStorage })

        // Méthode fictive bootstrap .modal('show'), évite typeError handleClickIconEye
        $.fn.modal = jest.fn();

        const handleClickIconE = jest.fn(billsCont.handleClickIconEye);

        // Simulation click iconEye
        const iconEye = screen.getAllByTestId('icon-eye');
        iconEye.forEach(el => {
          el.addEventListener("click", () => handleClickIconE(el));
          userEvent.click(el);
          expect(handleClickIconE).toHaveBeenCalled();
          expect(screen.queryByText("Justificatif")).toBeTruthy();
        })
      })
    })

    describe('When I click newBill button', () => {
      test(('Then, it should navigate to newBill page'), () => {
        // Charge la page html fonction mot clé
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // Charge page Bills + instance class Bills
        document.body.innerHTML = '';
        document.body.innerHTML = BillsUI({ data: bills })
        const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        //simulation click btn NewBill
        const handleClickNewBil = jest.fn(billsContainer.handleClickNewBill);
        const btnNewBill = screen.getByTestId('btn-new-bill');
        btnNewBill.addEventListener("click", handleClickNewBil);
        userEvent.click(btnNewBill);

        expect(handleClickNewBil).toHaveBeenCalled();
        // test si page newBill affichée (utilise ROUTES())
        expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();

      })
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bill", () => {
    test("fetches bills from mock API GET", async () => {

      jest.mock("../app/store", () => mockStore)

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      document.body.innerHTML = "";
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      
      window.onNavigate(ROUTES_PATH.Bills)
      console.log(document.body.innerHTML)
      // await waitFor(() => screen.getByText("Mes notes de frais"))
    })
  })

  /*
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
})
*/



})


/*
      console.log("ici21", document.body.innerHTML)
      import fetch from 'node-fetch'
*/